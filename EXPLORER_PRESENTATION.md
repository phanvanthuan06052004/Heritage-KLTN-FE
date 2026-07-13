# Explorer — Hệ thống Khám phá & Lập lịch trình Di sản

## Bài thuyết trình báo cáo Hội đồng (5 phút)

---

### 1. Tổng quan (30 giây)

Explorer là **trang chính** của hệ thống Heritage Map — nơi người dùng tương tác với bản đồ di sản Việt Nam, tìm kiếm, lọc, chọn điểm đến và **tự động tạo lịch trình du lịch thông minh** được tối ưu bởi AI.

**Truy cập:** `https://heritage.thuandev.id.vn/explore`

---

### 2. Giao diện & Trải nghiệm người dùng (1 phút)

#### Bản đồ tương tác (MapLibre GL)
- **780+ di sản** trên bản đồ Việt Nam với marker dạng triện theo danh mục (lịch sử: đỏ, tâm linh: vàng, thiên nhiên: xanh...)
- **Tìm kiếm** thông minh theo tên di sản hoặc tỉnh thành
- **Lọc theo danh mục** (8 loại: lịch sử, kiến trúc, tâm linh, bảo tàng, UNESCO, làng nghề, thiên nhiên, giải trí)
- **Popup chi tiết** khi click marker: tên, tỉnh, danh mục, mô tả, giờ mở cửa, giá vé, nút "Đưa vào lịch trình"

#### Trình thuật sĩ tạo lịch trình (5 tab)

| Tab | Nội dung | Bắt buộc |
|-----|----------|----------|
| **1. Vùng đất** | Chọn tỉnh/thành phố muốn đến | ✅ ≥ 1 tỉnh |
| **2. Di sản ưu tiên** | Chọn điểm bắt buộc ghé thăm | ✅ ≥ 1 điểm |
| **3. Sở thích** | Mục tiêu chuyến đi, nhóm người đi, nhịp độ, sở thích | ✅ Mục tiêu + Nhóm + ≥ 1 sở thích |
| **4. Khởi hành** | Điểm xuất phát/kết thúc (tìm kiếm địa chỉ hoặc GPS) | ✅ Có tọa độ |
| **5. Lộ trình** | Số ngày, số người, ngày đi, giờ bắt đầu/kết thúc | ✅ Có giá trị mặc định |

**Validation thông minh:** Mỗi tab kiểm tra dữ liệu bắt buộc trước khi cho qua tab tiếp theo. Thiếu trường nào → cảnh báo đỏ ngay trường đó + tab bị lỗi + banner trên cùng. Tự động biến mất khi người dùng điền đủ.

---

### 3. Luồng xử lý & Tích hợp AI (1 phút 30 giây)

```
Người dùng chọn tiêu chí → Gửi request → AI Pipeline (Map-Heritage) → Trả về lịch trình
```

#### Pipeline AI 8 bước (chạy phía backend):

| Bước | Chức năng | Thuật toán |
|------|-----------|------------|
| **1. Chuẩn hóa** | Phân tích đầu vào người dùng | Keyword matching (68+ từ khóa song ngữ) |
| **2. Lọc ứng viên** | Chọn di sản phù hợp từ 780+ điểm | Partial-credit category similarity (180 cặp quan hệ) |
| **3. Thời tiết** | Dự báo thời tiết cho ngày đi | Open-Meteo API (miễn phí, dự báo theo giờ) |
| **4. Chấm điểm** | Đánh giá từng di sản | 7 chiều: sở thích (30%), lịch sử (20%), thời tiết (15%), khoảng cách (15%), phổ biến (10%), tiếp cận (5%), ngân sách (5%) |
| **5. Phân ngày** | Chia di sản vào các ngày | Geographic clustering + pace limits + must-visit seeding |
| **6. Tối ưu tuyến** | Sắp xếp thứ tự tham quan tối ưu | OSRM road-distance exact TSP (≤8 sites) / 2-opt heuristic |
| **7. Kế hoạch ngày** | Lập timeline chi tiết | Time slot từ 08:00 + travel time + visit duration |
| **8. Đánh giá** | Chấm chất lượng lịch trình | 7 chiều quality score (route efficiency, schedule balance...) |

#### Tối ưu hóa đặc biệt:
- **Phát hiện đảo:** Tự động nhận diện tuyến qua đảo (ví dụ: đất liền → Phú Quốc) → hiển thị đường chim bay + cảnh báo "Vui lòng sử dụng tàu/thuyền"
- **Tối ưu đa tỉnh:** Route efficiency tự scale theo số tỉnh (1 tỉnh → 100km/ngày, 4 tỉnh → 200km/ngày)
- **Đa dạng hóa MMR:** Ngăn 3 điểm top cùng nằm 1 khu phố → đẩy điểm đa dạng địa lý lên

---

### 4. Hiển thị kết quả (1 phút)

Sau khi AI xử lý (~2-3 giây), người dùng nhận được:

#### Bản đồ lộ trình
- **Polyline** hiển thị tuyến đường thực tế qua OSRM (không phải đường chim bay)
- **Marker** đánh dấu từng điểm dừng
- **Màu sắc theo ngày** (đỏ son / vàng gold / nâu đất)
- Tự động zoom vừa toàn bộ lộ trình

#### Bảng tóm tắt (Route Summary)
- Tổng quãng đường (km), tổng thời gian, số di sản
- Tóm tắt AI: "Chuyến du lịch 3 ngày tại Hà Nội, Ninh Bình. Khám phá 15 di sản. CL: 68%"
- Ghi chú hành trình (cảnh báo đảo, OSRM fallback...)
- Chi tiết từng ngày: timeline, thời gian di chuyển giữa các điểm

#### Phát mô phỏng (Route Playback)
- **Xe 🚗 chạy** trên bản đồ theo lộ trình thực tế
- **Dừng tại mỗi điểm** → popup hỏi "Bạn có muốn nghe thông tin về điểm này không?"
- **Text-to-speech** đọc nội dung thuyết minh (tiếng Việt)
- Điều khiển: Play/Pause, chọn ngày, tốc độ (1x-10x), tua, restart
- **Bỏ qua tất cả** để xe chạy liên tục không dừng

#### Chia sẻ & In ấn
- Chia sẻ lịch trình qua link
- Xuất PDF/In lịch trình

---

### 5. Điểm sáng tạo & Khác biệt (30 giây)

| STT | Sáng tạo | Mô tả |
|-----|----------|-------|
| 1 | **Validation đa tab** | Kiểm tra từng bước, cảnh báo trực quan, không cho qua nếu thiếu |
| 2 | **Tích hợp OSRM thực tế** | Tuyến đường tính theo đường bộ thực, không phải đường chim bay |
| 3 | **Phát hiện đảo thông minh** | Tự động fallback + cảnh báo khi tuyến qua đảo |
| 4 | **Tối ưu toàn cục ≤8 điểm/ngày** | Exact TSP cho lịch trình thực tế (5.040 hoán vị cho 7 điểm) |
| 5 | **Giao diện triện/mộc bản** | Thiết kế theo chủ đề di sản Việt (màu son, vàng, ngà, nâu) |
| 6 | **Phát mô phỏng + thuyết minh** | Trải nghiệm nhập vai du lịch ảo với text-to-speech tiếng Việt |
| 7 | **Tự động geocode OSM** | Tìm kiếm địa chỉ → tự động lấy tọa độ OpenStreetMap |
| 8 | **MMR diversity** | Cân bằng chất lượng-đa dạng, tránh lặp điểm cùng khu vực |

---

### 6. Số liệu & Hiệu suất (30 giây)

| Chỉ số | Giá trị |
|--------|---------|
| Di sản trên bản đồ | **780+** (62 tỉnh thành) |
| Danh mục di sản | 8 loại |
| Thời gian tạo lịch trình | **2-3 giây** (full pipeline) |
| Độ chính xác tuyến đường | OSRM real road (không phải haversine) |
| Hỗ trợ đa tỉnh | ✅ (scale quality score theo số tỉnh) |
| Tương thích thiết bị | Desktop + Mobile + Tablet |
| Ngôn ngữ | Việt / Anh (i18n) |
| Dark mode | ✅ |

---

## Cảm ơn Hội đồng đã lắng nghe!
