# Bảng điều khiển Chuyển đổi WeCare - Hướng dẫn Sử dụng

Chào mừng bạn đến với bảng điều khiển dự án Chuyển đổi WeCare! Hướng dẫn này sẽ giúp bạn làm quen với các tính năng chính của ứng dụng.

## 1. Bắt đầu: Đăng nhập

1.  Khi bạn mở ứng dụng lần đầu, bạn sẽ thấy màn hình đăng nhập.
2.  Nhấp vào nút **"Sign In with Google"**.
3.  Một cửa sổ bật lên từ Google sẽ xuất hiện. Hãy chọn tài khoản Google của công ty và cấp các quyền được yêu cầu. Đây là bước cần thiết để ứng dụng có thể đọc và ghi dữ liệu dự án vào file Google Sheet chính.
4.  Sau khi đăng nhập thành công, bạn sẽ được chuyển đến bảng điều khiển dự án chính.

## 2. Điều hướng trên Bảng điều khiển

Thanh bên (sidebar) ở bên trái là công cụ điều hướng chính của bạn. Sơ đồ dưới đây minh họa cách bạn có thể di chuyển giữa các chế độ xem khác nhau:

```ascii
Thanh bên (Sidebar)
      │
      ├─── Mục Dashboard ──────────> Bảng Tổng quan (Kanban), Thống kê Tiến độ
      │     ├── Overview             (Bảng Kanban chính)
      │     ├── Stage Progress       (Xem tiến độ theo từng Giai đoạn)
      │     └── Department Progress  (Xem tiến độ theo từng Phòng ban)
      │
      ├─── Mục Stage ─────────────> Xem chi tiết theo Giai đoạn
      │     ├── Stage 1              (Tất cả công việc trong Stage 1)
      │     └── Stage 2...
      │
      └─── Mục Department ────────> Xem chi tiết theo Phòng ban
            ├── Finance              (Tất cả công việc của phòng Finance)
            └── Sales...
```

-   **Mục Dashboard:**
    -   **Overview (Tổng quan):** Đây là bảng dự án chính. Nó hiển thị tất cả các công việc trong một lưới, được sắp xếp theo phòng ban (hàng) và giai đoạn dự án (cột). Đây là nơi tốt nhất để có cái nhìn toàn cảnh về tình trạng của dự án.
    -   **Stage Progress (Tiến độ Giai đoạn):** Chế độ xem này hiển thị các số liệu thống kê cấp cao cho mỗi giai đoạn của dự án, bao gồm tỷ lệ phần trăm tiến độ tổng thể và số lượng công việc.
    -   **Department Progress (Tiến độ Phòng ban):** Chế độ xem này hiển thị các thống kê tương tự, nhưng được phân chia theo từng phòng ban.

-   **Mục Stage (Giai đoạn):**
    -   Nhấp vào bất kỳ giai đoạn nào (ví dụ: "Stage 1...") để xem danh sách chi tiết tất cả các công việc trong giai đoạn đó, được nhóm theo phòng ban chịu trách nhiệm.

-   **Mục Department (Phòng ban):**
    -   Nhấp vào bất kỳ phòng ban nào (ví dụ: "Finance & Accounting") để xem tất cả các công việc được giao cho phòng ban đó, được nhóm theo từng giai đoạn.

## 3. Xem và Cập nhật Công việc

Luồng cập nhật một công việc rất đơn giản và trực quan:

```ascii
1. Nhấp vào Thẻ công việc   2. Cửa sổ Chi tiết Mở ra   3. Chỉnh sửa thông tin       4. Lưu thay đổi
┌──────────────────┐       ┌───────────────────┐     ┌───────────────────┐       ┌──────────────┐
│ ┌──────────────┐ │       │                   │     │ Tên công việc: [___]│     │              │
│ │ Task A       │ │  ───> │ Task A Details    │ ───>│ Trạng thái: [In Prog] │ ───>│  Lưu vào     │
│ │ Progress: 50%│ │       │ [Form chỉnh sửa]  │     │ Tiến độ:   [|||||]  │     │ Google Sheet │
│ └──────────────┘ │       │                   │     │                   │     │              │
└──────────────────┘       └───────────────────┘     └───────────────────┘       └──────────────┘
(Trên Bảng điều khiển)    (Modal hiện lên)          (Thay đổi dữ liệu)        (Nhấn "Save Changes")
```

-   **Xem Chi tiết:** Trên bất kỳ trang nào có thẻ công việc, chỉ cần nhấp vào một thẻ để mở cửa sổ xem **Chi tiết Công việc**.
-   **Chỉnh sửa Công việc:**
    1.  Trong cửa sổ Chi tiết Công việc, tất cả các trường thông tin đều có thể chỉnh sửa. Bạn có thể:
        -   Thay đổi tên công việc.
        -   Chọn **Người phụ trách (PIC)** từ danh sách thả xuống.
        -   Cập nhật tiến độ bằng thanh trượt.
        -   Thay đổi trạng thái.
        -   Chỉnh sửa các ghi chú và sản phẩm đầu ra.
    2.  Sau khi thực hiện các thay đổi, nhấp vào nút **"Save Changes"** ở góc dưới cùng bên phải.
    3.  Các cập nhật của bạn sẽ được lưu trực tiếp vào Google Sheet trong thời gian thực.
    4.  Nếu bạn muốn thoát mà không lưu, hãy nhấp vào **"Cancel"** hoặc biểu tượng **"X"** ở góc trên cùng bên phải.

## 4. Tùy chỉnh Giao diện

-   **Chuyển đổi Giao diện (Sáng/Tối):** Ở góc trên cùng bên phải của thanh tiêu đề, bạn sẽ tìm thấy biểu tượng mặt trời/mặt trăng. Nhấp vào đây để chuyển đổi giữa giao diện sáng và tối cho phù hợp với sở thích của bạn.

## 5. Đăng xuất

-   Khi bạn hoàn tất công việc, bạn có thể nhấp vào nút **"Sign Out"** trên thanh tiêu đề. Thao tác này sẽ đăng xuất bạn một cách an toàn và đưa bạn trở lại màn hình đăng nhập.
