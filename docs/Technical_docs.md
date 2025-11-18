# WeCare Transition Dashboard - Tài liệu Kỹ thuật

Tài liệu này cung cấp thông tin chi tiết về kiến trúc, luồng dữ liệu và các thành phần của ứng dụng để phục vụ cho việc bảo trì và phát triển trong tương lai.

## 1. Tổng quan Kiến trúc

- **Framework:** React 19 (sử dụng TypeScript) để xây dựng giao diện người dùng linh hoạt và có thể tái sử dụng.
- **Styling:** Tailwind CSS v3 để tạo kiểu nhanh chóng và nhất quán trực tiếp trong mã JSX.
- **Môi trường Phát triển:** Vite (thông qua môi trường của AI Studio) để có trải nghiệm phát triển nhanh và tối ưu hóa build.
- **Quản lý Trạng thái:** React Hooks (`useState`, `useEffect`, `useMemo`) để quản lý trạng thái cục bộ và vòng đời của component.
- **Tích hợp API:**
  - **Google Sheets API v4:** Đóng vai trò là "backend", được sử dụng để đọc và ghi dữ liệu công việc.
  - **Google Identity Services:** Dùng cho việc xác thực OAuth 2.0, đảm bảo quyền truy cập an toàn vào Google Sheet.

## 2. Mô hình Dữ liệu & Cấu trúc Google Sheet

Nguồn dữ liệu duy nhất của ứng dụng là một bảng tính Google Sheet, bao gồm ba sheet chính: `Tasks`, `Discussions`, và `Project member`.

### Cấu trúc Sheet 'Tasks'

Mỗi hàng đại diện cho một công việc.

| Cột | Tên trường        | Mô tả                                       | Ánh xạ sang `Task` |
|:---:|-------------------|---------------------------------------------|--------------------|
| A   | `stageName`       | Tên giai đoạn (ví dụ: "Stage 1")            | `stageName`        |
| B   | `departmentName`  | Tên phòng ban (ví dụ: "Sales")              | `departmentName`   |
| C   | `taskId`          | Mã định danh duy nhất của công việc         | `id`               |
| D   | `taskName`        | Tên/Tiêu đề của công việc                   | `pic`              |
| E   | `description`     | Ghi chú chi tiết về công việc               | `notes`            |
| F   | `pic`             | Người phụ trách (Person In Charge)          | `description`      |
| G   | `deliverables`    | Các sản phẩm đầu ra, phụ thuộc             | `dependencies`     |
| H   | `status`          | Trạng thái công việc (ví dụ: "In Progress") | `status`           |
| I   | `progressStr`     | Tiến độ dưới dạng chuỗi (ví dụ: "50%")      | `progress`         |
| J   | `startDate`       | Ngày bắt đầu                                | `startDate`        |
| K   | `endDate`         | Ngày kết thúc                               | `endDate`          |
| L   | `duration`        | Thời gian thực hiện                         | `duration`         |

*Lưu ý: Có một sự không nhất quán trong việc đặt tên giữa sheet và code. Ví dụ, cột `taskName` trong sheet được ánh xạ vào trường `pic` trong ứng dụng, và cột `pic` trong sheet lại ánh xạ vào `description`.*

### Cấu trúc Sheet 'Discussions'

Sheet này lưu trữ tất cả các bình luận, câu hỏi, và các vấn đề liên quan đến từng công việc.

| Cột | Tên Cột (Header) | Mô tả                                                                 | Trường Dữ liệu (trong Code) |
|:---:|:-----------------|:----------------------------------------------------------------------|:----------------------------|
| A   | `Mã Công Việc`   | Mã công việc (tham chiếu đến Cột C của sheet 'Tasks') để liên kết bình luận. | `taskId`                    |
| B   | `Thời Gian`      | Dấu thời gian (ISO 8601) khi bình luận được đăng.                      | `timestamp`                 |
| C   | `Tác Giả`        | Tên người đăng bình luận.                                             | `author`                    |
| D   | `Nội Dung`       | Nội dung của bình luận hoặc vấn đề.                                   | `content`                   |

**Lưu ý quan trọng:** Tên các cột (header) trong Google Sheet chỉ dùng để người dùng dễ đọc. Ứng dụng đọc dữ liệu dựa trên **thứ tự cột** (A, B, C, D), vì vậy bạn có thể tùy chỉnh tên cột theo ý muốn mà không ảnh hưởng đến hoạt động của ứng dụng.

### Cấu trúc Sheet 'Project member'

Sheet này định nghĩa danh sách các thành viên trong dự án, được sử dụng để điền vào danh sách thả xuống cho trường "Người phụ trách" (PIC).

| Cột | Tên Cột (Header) | Mô tả                                  |
|:---:|:-----------------|:---------------------------------------|
| A   | `Name`           | Tên đầy đủ của thành viên dự án.      |
| B   | `Department`     | Phòng ban mà thành viên đó thuộc về. |

### Quá trình Xử lý Dữ liệu

Hàm `parseSheetData` trong `App.tsx` chịu trách nhiệm:
1.  Đọc dữ liệu thô từ cả hai sheet `Tasks` và `Discussions`.
2.  Xử lý `Discussions` trước, nhóm các bình luận theo `taskId`.
3.  Lặp qua từng hàng trong `Tasks`, chuyển đổi mỗi hàng thành một đối tượng `Task`.
4.  Gán mảng các bình luận tương ứng vào mỗi đối tượng `Task`.
5.  Nhóm các `Task` theo `departmentName` và `stageId` để tạo ra cấu trúc dữ liệu `Department[]` mà ứng dụng sử dụng.

## 3. Luồng Hoạt động của Ứng dụng

### 3.1. Luồng Xác thực

```ascii
Người dùng           Giao diện App              Google Identity Services         Google Sheets API
 │                      │                               │                                │
 │ Truy cập App         │                               │                                │
 │─────────────────────>│ Hiển thị màn hình Login        │                                │
 │                      │                               │                                │
 │ Nhấn "Sign In"       │                               │                                │
 │─────────────────────>│ Gọi hàm onSignIn()             │                                │
 │                      │ tokenClient.requestAccessToken()│                                │
 │                      │──────────────────────────────>│ Hiển thị Popup OAuth           │
 │                      │                               │───────────────────────────────>│
 │ Đăng nhập &          │                               │                                │
 │ Cấp quyền            │                               │                                │
 │<─────────────────────│                               │<───────────────────────────────│
 │                      │                               │ Trả về access token            │
 │                      │ <─────────────────────────────│                                │
 │                      │ Lưu token vào state (`accessToken`) │                                │
 │                      │ Hiển thị giao diện chính      │                                │
 │                      │                               │                                │
```

### 3.2. Luồng Tải Dữ liệu

```ascii
Giao diện App (useEffect)      gapi.client (Thư viện JS)     Google Sheets API
 │                              │                              │
 │ Kiểm tra `accessToken`?      │                              │
 │─────────────────────────────>│                              │
 │ Có, tải dữ liệu              │                              │
 │ gapi.sheets.values.get()     │                              │
 │ (gọi cho cả Tasks & Discussions)│                              │
 │─────────────────────────────>│ Thêm token vào header        │
 │                              │─────────────────────────────>│ GET Dữ liệu Sheet
 │                              │                              │
 │                              │ <────────────────────────────│ Trả về dữ liệu (JSON)
 │ <────────────────────────────│                              │
 │                              │                              │
 │ parseSheetData()             │                              │
 │ Cập nhật state (setDepartments) │                              │
 │ Hiển thị UI với dữ liệu      │                              │
 │                              │                              │
```

### 3.3. Luồng Cập nhật Dữ liệu (Optimistic UI)

Khi người dùng lưu một công việc hoặc đăng một bình luận, giao diện được cập nhật ngay lập tức để tạo cảm giác phản hồi nhanh.

```ascii
Người dùng             Giao diện App               gapi.client (Thư viện JS)      Google Sheets API
 │                          │                           │                           │
 │ Chỉnh sửa task           │                           │                           │
 │ Nhấn "Save" / "Post"     │                           │                           │
 │─────────────────────────>│ handleUpdateTask() / handleAddDiscussion()
 │                          │ (1) Cập nhật UI tạm thời  │                           │
 │                          │ setDepartments(...)       │                           │
 │                          │ Đóng modal / Xóa input    │                           │
 │                          │                           │                           │
 │                          │ (2) Gọi API              │                           │
 │                          │ gapi.sheets.values.update() / .append()
 │                          │──────────────────────────>│ Thêm token vào header     │
 │                          │                           │──────────────────────────>│ PUT/APPEND Dữ liệu
 │                          │                           │                           │
 │                          │                           │ <────────────────────────│ Trả về thành công/lỗi
 │                          │ <─────────────────────────│                           │
 │                          │                           │                           │
 │                          │ (3) Nếu Lỗi:              │                           │
 │                          │  - Hoàn tác lại UI        │                           │
 │                          │  - Hiển thị thông báo lỗi │                           │
 │                          │                           │                           │
```

## 4. Quản lý Trạng thái (State Management)

Toàn bộ trạng thái được quản lý bởi component `App.tsx` và truyền xuống các component con thông qua props.

- **`accessToken: string | null`**: Lưu trữ token xác thực của Google. Sự thay đổi của state này (từ `null` sang chuỗi) sẽ kích hoạt việc tải dữ liệu.
- **`departments: Department[]`**: Mảng chứa toàn bộ dữ liệu công việc của dự án, đã được xử lý và cấu trúc hóa. Đây là "nguồn sự thật" cho hầu hết các component hiển thị.
- **`activeView: string`**: Xác định trang nào đang được hiển thị trong khu vực nội dung chính (ví dụ: 'dashboard/overview', 'stage/1').
- **`loading: boolean`**: Cờ cho biết ứng dụng có đang trong quá trình tải dữ liệu hay không.
- **`error: string | null`**: Lưu trữ thông báo lỗi nếu có sự cố xảy ra trong quá trình tải hoặc cập nhật dữ liệu.
- **`selectedTask: Task | null`**: Giữ thông tin của công việc đang được chọn để hiển thị trong modal chi tiết.

## 5. Cấu trúc Component

```
src/
├── App.tsx             # Component chính, xử lý trạng thái, xác thực, logic định tuyến
├── index.tsx           # Điểm khởi tạo của React
├── types.ts            # Định nghĩa các kiểu dữ liệu TypeScript (Task, Stage, Department)
├── constants.tsx       # Hằng số toàn cục (ID API, dữ liệu tĩnh, cấu hình)
│
├── components/
│   ├── Header.tsx          # Thanh tiêu đề trên cùng
│   ├── Sidebar.tsx         # Menu điều hướng bên trái
│   ├── ProjectBoard.tsx    # Lưới hiển thị chính của các công việc
│   ├── TaskCard.tsx        # Thẻ hiển thị thông tin tóm tắt của một công việc
│   ├── TaskDetailModal.tsx # Modal để xem và chỉnh sửa chi tiết công việc. Trường 'Người phụ trách' (PIC) là một danh sách thả xuống được điền dữ liệu từ sheet `Project member` để đảm bảo dữ liệu nhất quán.
│   └── ...                 # Các component tái sử dụng khác
│
└── pages/
    ├── DashboardOverview.tsx   # Trang tổng quan, chứa ProjectBoard
    ├── StageProgress.tsx       # Trang hiển thị tiến độ theo từng giai đoạn
    ├── DepartmentProgress.tsx  # Trang hiển thị tiến độ theo từng phòng ban
    └── ...                     # Các trang chi tiết khác
```

## 6. Xử lý Lỗi

- **Lỗi xác thực:** Nếu người dùng không đăng nhập hoặc token hết hạn/bị thu hồi, ứng dụng sẽ hiển thị màn hình đăng nhập.
- **Lỗi API (đọc/ghi sheet):** Một thông báo lỗi rõ ràng sẽ được hiển thị trong khu vực nội dung chính, kèm theo nút để thử lại hoặc đăng nhập lại.
- **Lỗi xử lý dữ liệu:** Các lỗi nhỏ (ví dụ: một hàng dữ liệu không hợp lệ) sẽ được ghi vào console (`console.warn`) để gỡ lỗi mà không làm sập ứng dụng.

## 7. Hướng dẫn Bảo trì

- **Cập nhật Cấu trúc Công việc:** Nếu có thêm cột mới trong Google Sheet, cần cập nhật:
    1.  Interface `Task` trong `types.ts`.
    2.  Hàm `parseSheetData` trong `App.tsx` để đọc dữ liệu từ cột mới.
    3.  Hàm `handleUpdateTask` trong `App.tsx` để có thể ghi dữ liệu vào cột mới.
    4.  Component `TaskDetailModal.tsx` để hiển thị và cho phép chỉnh sửa trường dữ liệu mới.
- **Thêm Phòng ban/Giai đoạn mới:** Chỉ cần cập nhật các mảng `DEPARTMENTS_CONFIG` hoặc `STAGES` trong file `constants.tsx`. Ứng dụng được thiết kế để tự động hiển thị dữ liệu mới mà không cần thay đổi logic.
- **Thay đổi Quyền API:** Nếu cần quyền truy cập khác vào Google API, cập nhật biến `GOOGLE_API_SCOPES` trong `constants.tsx`.