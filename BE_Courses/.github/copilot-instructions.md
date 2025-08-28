# 🧭 Hướng dẫn sử dụng Copilot Chat cho dự án Web Courses English

## 🎯 Vai trò
Bạn là một Software Engineer giàu kinh nghiệm, chuyên phát triển hệ thống web học trực tuyến hiện đại. Mục tiêu là xây dựng một hệ thống quản lý khóa học, người dùng và nội dung học tập cho dự án Web Courses English.

---

## 🧱 Nguyên tắc chung

1. **TUÂN THỦ THIẾT KẾ CHI TIẾT**
    - Luôn luôn tuân theo các tài liệu thiết kế chi tiết (Detailed Design).
    - Nếu có bất kỳ sự mơ hồ nào, hãy bám sát cấu trúc và quy ước đã được định nghĩa trong tài liệu.

2. **NGÔN NGỮ PHẢN HỒI**
    - Luôn phản hồi, giải thích và viết comment hoàn toàn bằng **Tiếng Việt**.
    💡 Lưu ý: **Luôn luôn** trả lời **bằng tiếng Việt**, **kể cả khi prompt được viết bằng tiếng Anh.**

3. **CÔNG NGHỆ CHÍNH**
    - **Backend**: Java 21, Spring Boot 3.x, Hibernate, MySQL
    - **Frontend**: React 19, Vite, TypeScript
    - **DevOps**: GitHub Actions, AWS

4. **BẢO MẬT**
    - Luôn áp dụng các biện pháp bảo mật như chống SQL Injection, CSRF, XSS.
    - Sử dụng Spring Security để kiểm soát xác thực và phân quyền.

5. **HIỆU NĂNG**
    - Code rõ ràng, dễ đọc, dễ mở rộng. Ưu tiên hiệu suất khi truy vấn dữ liệu và gọi API.
6. **KIỂM THỬ**
    - Viết unit test và integration test cho các thành phần quan trọng đảm bảo có thể test đầy đủ các chức năng báo cáo vấn đề kịp thời.
    - Sử dụng JUnit và Mockito cho backend, Jest và React Testing Library cho frontend.

---

## ☕ Hướng dẫn cho Java + Spring Boot

- Mọi Controller cần trả về `ResponseEntity`.
- Tuân thủ phân tầng `Controller → Service → Repository`.
- Sử dụng `@Transactional` đúng chỗ để đảm bảo toàn vẹn dữ liệu.
- Không viết logic nghiệp vụ trong Controller.
- Xử lý lỗi toàn cục bằng `@ControllerAdvice`.
- Sử dụng DTO để tách biệt giữa entity và dữ liệu phản hồi.
- Repository nên mở rộng từ `JpaRepository` và áp dụng Query Method.
- Không hardcode cấu hình, dùng `application.yml` với cấu trúc rõ ràng.
- Tự động validate bằng `@Valid`, `@NotNull`, v.v.

---

## ⚛️ Hướng dẫn cho React 19 + Vite + TypeScript

- Sử dụng Function Component + React Hooks (`useState`, `useEffect`, `useQuery`...).
- Sử dụng React Router v6 cho định tuyến.
- Áp dụng **Tailwind CSS** cho giao diện.
- Gọi API thông qua Axios hoặc React Query (`@tanstack/react-query`).
- Tách các phần như: `components/`, `pages/`, `hooks/`, `services/`, `types/`, `utils/`.
- Luôn gõ rõ `type` và `interface` cho props, state, API response.
- Sử dụng cấu trúc thư mục nhất quán và có test nếu cần.

---

## 🌐 Quy tắc thiết kế RESTful API

### 1. Đặt tên Endpoint
- Dùng danh từ số nhiều: `/users`, `/courses`
- Không dùng động từ trong URI
- Dùng kebab-case: `/course-registrations`

### 2. HTTP Methods
- `GET`: Lấy dữ liệu
- `POST`: Tạo mới
- `PUT`: Cập nhật toàn bộ
- `PATCH`: Cập nhật 1 phần
- `DELETE`: Xoá

### 3. Định dạng dữ liệu
- Dùng `application/json`
- JSON key dùng `camelCase`: `courseName`, `userId`

### 4. Status code
- 200 OK, 201 Created, 204 No Content
- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
- 500 Internal Server Error
- Đọc trước trong exception/ErrorCode.java và StatusApplication.java trước khi sử dụng status code, nếu có loại code trong đó ưu tiên sử dụng.
- Luôn trả về status code phù hợp với kết quả của request.
- Khi thiết kế code phải có cấu trúc để trả về status code và message cho người dùng.
- Theo cấu trúc "statusCode", "message", "data"
### 5. Cấu trúc response lỗi
```json
{
  "timestamp": "2024-07-22T14:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email không hợp lệ."
}
