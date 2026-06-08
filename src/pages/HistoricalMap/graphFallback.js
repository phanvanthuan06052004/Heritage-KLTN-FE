/**
 * FALLBACK OFFLINE 'Vietnam Historical Universe' — sinh tự động từ API /graph/* (Neo4j).
 */

export const FALLBACK_MAP_LOCATIONS = [
  {
    "id": "hoi_nghi_binh_than",
    "name": "Hội nghị Bình Than",
    "nameEn": "Bình Than Conference",
    "year": "1282",
    "yearStart": 1282,
    "yearEnd": 1282,
    "type": "event",
    "lng": 106.2,
    "lat": 21.05,
    "province": "Bắc Ninh",
    "summary": "Hội nghị quân sự các vương hầu bàn kế chống giặc; nơi Trần Quốc Toản bóp nát quả cam vì còn nhỏ không được dự.",
    "neighbors": [
      {
        "node": {
          "name": "Kháng chiến lần 2",
          "id": "khang_chien_2",
          "type": "event"
        },
        "relation": "PRECEDED",
        "direction": "out"
      },
      {
        "node": {
          "name": "Trần Quốc Toản",
          "id": "tran_quoc_toan",
          "type": "person"
        },
        "relation": "RELATED_TO",
        "direction": "in"
      }
    ]
  },
  {
    "id": "hoi_nghi_dien_hong",
    "name": "Hội nghị Diên Hồng",
    "nameEn": "Diên Hồng Conference",
    "year": "1284",
    "yearStart": 1284,
    "yearEnd": 1284,
    "type": "event",
    "lng": 105.84,
    "lat": 21.03,
    "province": "Thăng Long",
    "summary": "Thái thượng hoàng Trần Thánh Tông mời các bô lão cả nước hỏi kế đánh hay hoà — tất cả đồng thanh \"Đánh!\". Biểu tượng của ý chí toàn dân.",
    "neighbors": [
      {
        "node": {
          "name": "Kháng chiến lần 2",
          "id": "khang_chien_2",
          "type": "event"
        },
        "relation": "PRECEDED",
        "direction": "out"
      },
      {
        "node": {
          "name": "Trần Thánh Tông",
          "id": "tran_thanh_tong",
          "type": "person"
        },
        "relation": "CONVENED",
        "direction": "in"
      }
    ]
  },
  {
    "id": "dong_bo_dau_1258",
    "name": "Trận Đông Bộ Đầu",
    "nameEn": "Battle of Đông Bộ Đầu",
    "year": "1258",
    "yearStart": 1258,
    "yearEnd": 1258,
    "type": "battle",
    "lng": 105.852,
    "lat": 21.043,
    "province": "Thăng Long",
    "summary": "Trận phản công đêm giải phóng kinh thành Thăng Long, kết thúc thắng lợi cuộc kháng chiến lần thứ nhất (1258).",
    "neighbors": [
      {
        "node": {
          "name": "Thăng Long",
          "id": "thang_long",
          "type": "capital"
        },
        "relation": "LOCATED_AT",
        "direction": "out"
      },
      {
        "node": {
          "name": "Trần Thái Tông",
          "id": "tran_thai_tong",
          "type": "person"
        },
        "relation": "COMMANDED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Kháng chiến lần 1",
          "id": "khang_chien_1",
          "type": "event"
        },
        "relation": "PART_OF",
        "direction": "out"
      }
    ]
  },
  {
    "id": "ham_tu_1285",
    "name": "Trận Hàm Tử",
    "nameEn": "Battle of Hàm Tử",
    "year": "1285",
    "yearStart": 1285,
    "yearEnd": 1285,
    "type": "battle",
    "lng": 105.97,
    "lat": 20.78,
    "province": "Hưng Yên",
    "summary": "Trần Nhật Duật chỉ huy đánh tan quân Nguyên ở cửa Hàm Tử, mở màn cho cuộc phản công chiến lược 1285.",
    "neighbors": [
      {
        "node": {
          "name": "Trần Nhật Duật",
          "id": "tran_nhat_duat",
          "type": "person"
        },
        "relation": "COMMANDED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Kháng chiến lần 2",
          "id": "khang_chien_2",
          "type": "event"
        },
        "relation": "PART_OF",
        "direction": "out"
      }
    ]
  },
  {
    "id": "chuong_duong_1285",
    "name": "Trận Chương Dương",
    "nameEn": "Battle of Chương Dương",
    "year": "1285",
    "yearStart": 1285,
    "yearEnd": 1285,
    "type": "battle",
    "lng": 105.86,
    "lat": 20.87,
    "province": "Hà Nội",
    "summary": "Trần Quang Khải chỉ huy đánh chiếm bến Chương Dương, dọn đường tiến vào giải phóng Thăng Long.",
    "neighbors": [
      {
        "node": {
          "name": "Trần Quốc Toản",
          "id": "tran_quoc_toan",
          "type": "person"
        },
        "relation": "FOUGHT_IN",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trần Quang Khải",
          "id": "tran_quang_khai",
          "type": "person"
        },
        "relation": "COMMANDED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Kháng chiến lần 2",
          "id": "khang_chien_2",
          "type": "event"
        },
        "relation": "PART_OF",
        "direction": "out"
      }
    ]
  },
  {
    "id": "tay_ket_1285",
    "name": "Trận Tây Kết",
    "nameEn": "Battle of Tây Kết",
    "year": "1285",
    "yearStart": 1285,
    "yearEnd": 1285,
    "type": "battle",
    "lng": 105.98,
    "lat": 20.75,
    "province": "Hưng Yên",
    "summary": "Quân Trần tiêu diệt cánh quân Toa Đô; chủ tướng Toa Đô bị chém đầu, khép lại cuộc kháng chiến lần 2.",
    "neighbors": [
      {
        "node": {
          "name": "Toa Đô",
          "id": "toa_do",
          "type": "enemy"
        },
        "relation": "DEFEATED",
        "direction": "out"
      },
      {
        "node": {
          "name": "Trần Hưng Đạo",
          "id": "tran_hung_dao",
          "type": "person"
        },
        "relation": "COMMANDED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Kháng chiến lần 2",
          "id": "khang_chien_2",
          "type": "event"
        },
        "relation": "PART_OF",
        "direction": "out"
      }
    ]
  },
  {
    "id": "van_don_1287",
    "name": "Trận Vân Đồn",
    "nameEn": "Battle of Vân Đồn",
    "year": "1287",
    "yearStart": 1287,
    "yearEnd": 1287,
    "type": "battle",
    "lng": 107.42,
    "lat": 21.06,
    "province": "Quảng Ninh",
    "summary": "Trần Khánh Dư tiêu diệt đoàn thuyền lương khổng lồ của Trương Văn Hổ — đòn hậu cần quyết định khiến quân Nguyên lâm vào cảnh đói.",
    "neighbors": [
      {
        "node": {
          "name": "Trương Văn Hổ",
          "id": "truong_van_ho",
          "type": "enemy"
        },
        "relation": "DEFEATED",
        "direction": "out"
      },
      {
        "node": {
          "name": "Trần Khánh Dư",
          "id": "tran_khanh_du",
          "type": "person"
        },
        "relation": "COMMANDED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Kháng chiến lần 3",
          "id": "khang_chien_3",
          "type": "event"
        },
        "relation": "PART_OF",
        "direction": "out"
      }
    ]
  },
  {
    "id": "bach_dang_1288",
    "name": "Trận Bạch Đằng",
    "nameEn": "Battle of Bạch Đằng (1288)",
    "year": "1288",
    "yearStart": 1288,
    "yearEnd": 1288,
    "type": "battle",
    "lng": 106.78,
    "lat": 20.92,
    "province": "Quảng Ninh – Hải Phòng",
    "summary": "Đại thắng kinh điển: Trần Hưng Đạo dùng kế cắm cọc gỗ lợi dụng thuỷ triều, tiêu diệt và bắt sống toàn bộ thuỷ quân Nguyên, bắt Ô Mã Nhi.",
    "neighbors": [
      {
        "node": {
          "name": "Bãi cọc Bạch Đằng",
          "id": "bai_coc_bach_dang",
          "type": "heritage"
        },
        "relation": "COMMEMORATES",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trận địa cọc Bạch Đằng",
          "id": "coc_go_bach_dang",
          "type": "artifact"
        },
        "relation": "USED_IN",
        "direction": "in"
      },
      {
        "node": {
          "name": "Thoát Hoan",
          "id": "thoat_hoan",
          "type": "enemy"
        },
        "relation": "DEFEATED",
        "direction": "out"
      },
      {
        "node": {
          "name": "Ô Mã Nhi",
          "id": "o_ma_nhi",
          "type": "enemy"
        },
        "relation": "CAPTURED",
        "direction": "out"
      },
      {
        "node": {
          "name": "Vạn Kiếp",
          "id": "van_kiep",
          "type": "capital"
        },
        "relation": "STAGED_FROM",
        "direction": "out"
      },
      {
        "node": {
          "name": "Phạm Ngũ Lão",
          "id": "pham_ngu_lao",
          "type": "person"
        },
        "relation": "FOUGHT_IN",
        "direction": "in"
      },
      {
        "node": {
          "name": "Dã Tượng",
          "id": "da_tuong",
          "type": "person"
        },
        "relation": "FOUGHT_IN",
        "direction": "in"
      },
      {
        "node": {
          "name": "Yết Kiêu",
          "id": "yet_kieu",
          "type": "person"
        },
        "relation": "FOUGHT_IN",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trần Thánh Tông",
          "id": "tran_thanh_tong",
          "type": "person"
        },
        "relation": "LED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trần Nhân Tông",
          "id": "tran_nhan_tong",
          "type": "person"
        },
        "relation": "LED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trần Hưng Đạo",
          "id": "tran_hung_dao",
          "type": "person"
        },
        "relation": "COMMANDED",
        "direction": "in"
      },
      {
        "node": {
          "name": "Kháng chiến lần 3",
          "id": "khang_chien_3",
          "type": "event"
        },
        "relation": "PART_OF",
        "direction": "out"
      }
    ]
  },
  {
    "id": "thang_long",
    "name": "Thăng Long",
    "nameEn": "Thăng Long Citadel",
    "year": "1010–nay",
    "yearStart": 1010,
    "yearEnd": 1400,
    "type": "capital",
    "lng": 105.834,
    "lat": 21.028,
    "province": "Hà Nội",
    "summary": "Kinh đô Đại Việt thời Trần; ba lần bị quân Nguyên chiếm rồi đều được quân dân nhà Trần giải phóng.",
    "neighbors": [
      {
        "node": {
          "name": "Hoàng thành Thăng Long",
          "id": "hoang_thanh_thang_long",
          "type": "heritage"
        },
        "relation": "PART_OF",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trận Đông Bộ Đầu",
          "id": "dong_bo_dau_1258",
          "type": "battle"
        },
        "relation": "LOCATED_AT",
        "direction": "in"
      },
      {
        "node": {
          "name": "Nhà Trần",
          "id": "nha_tran",
          "type": "dynasty"
        },
        "relation": "CAPITAL_AT",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trần Nhân Tông",
          "id": "tran_nhan_tong",
          "type": "person"
        },
        "relation": "RULED_FROM",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trần Thái Tông",
          "id": "tran_thai_tong",
          "type": "person"
        },
        "relation": "RULED_FROM",
        "direction": "in"
      }
    ]
  },
  {
    "id": "van_kiep",
    "name": "Vạn Kiếp",
    "nameEn": "Vạn Kiếp",
    "year": "TK XIII",
    "yearStart": 1283,
    "yearEnd": 1288,
    "type": "capital",
    "lng": 106.36,
    "lat": 21.12,
    "province": "Hải Dương",
    "summary": "Đại bản doanh của Trần Hưng Đạo, căn cứ thuỷ – bộ trọng yếu án ngữ đường tiến quân của giặc về Thăng Long.",
    "neighbors": [
      {
        "node": {
          "name": "Đền Kiếp Bạc",
          "id": "den_kiep_bac",
          "type": "heritage"
        },
        "relation": "LOCATED_AT",
        "direction": "in"
      },
      {
        "node": {
          "name": "Trận Bạch Đằng",
          "id": "bach_dang_1288",
          "type": "battle"
        },
        "relation": "STAGED_FROM",
        "direction": "in"
      }
    ]
  },
  {
    "id": "thien_truong",
    "name": "Phủ Thiên Trường",
    "nameEn": "Thiên Trường",
    "year": "TK XIII",
    "yearStart": 1239,
    "yearEnd": 1400,
    "type": "capital",
    "lng": 106.18,
    "lat": 20.42,
    "province": "Nam Định",
    "summary": "Quê hương và \"kinh đô thứ hai\" của nhà Trần, nơi các Thái thượng hoàng lui về và là hậu phương vững chắc trong kháng chiến.",
    "neighbors": [
      {
        "node": {
          "name": "Đền Trần (Nam Định)",
          "id": "den_tran_nam_dinh",
          "type": "heritage"
        },
        "relation": "LOCATED_AT",
        "direction": "in"
      },
      {
        "node": {
          "name": "Nhà Trần",
          "id": "nha_tran",
          "type": "dynasty"
        },
        "relation": "ORIGINATED_FROM",
        "direction": "in"
      }
    ]
  },
  {
    "id": "den_kiep_bac",
    "name": "Đền Kiếp Bạc",
    "nameEn": "Kiếp Bạc Temple",
    "year": "1300–nay",
    "yearStart": 1300,
    "yearEnd": 2025,
    "type": "heritage",
    "lng": 106.36,
    "lat": 21.12,
    "province": "Hải Dương",
    "summary": "Đền thờ Hưng Đạo Đại Vương Trần Quốc Tuấn tại Vạn Kiếp, một trong những di tích thờ Trần Hưng Đạo lớn nhất cả nước.",
    "neighbors": [
      {
        "node": {
          "name": "Vạn Kiếp",
          "id": "van_kiep",
          "type": "capital"
        },
        "relation": "LOCATED_AT",
        "direction": "out"
      },
      {
        "node": {
          "name": "Trần Hưng Đạo",
          "id": "tran_hung_dao",
          "type": "person"
        },
        "relation": "COMMEMORATES",
        "direction": "out"
      }
    ]
  },
  {
    "id": "den_tran_nam_dinh",
    "name": "Đền Trần (Nam Định)",
    "nameEn": "Trần Temple, Nam Định",
    "year": "1695–nay",
    "yearStart": 1695,
    "yearEnd": 2025,
    "type": "heritage",
    "lng": 106.18,
    "lat": 20.43,
    "province": "Nam Định",
    "summary": "Khu đền thờ 14 vị vua Trần trên đất phát tích Thiên Trường, nổi tiếng với lễ Khai ấn đầu xuân.",
    "neighbors": [
      {
        "node": {
          "name": "Phủ Thiên Trường",
          "id": "thien_truong",
          "type": "capital"
        },
        "relation": "LOCATED_AT",
        "direction": "out"
      },
      {
        "node": {
          "name": "Nhà Trần",
          "id": "nha_tran",
          "type": "dynasty"
        },
        "relation": "COMMEMORATES",
        "direction": "out"
      }
    ]
  },
  {
    "id": "bai_coc_bach_dang",
    "name": "Bãi cọc Bạch Đằng",
    "nameEn": "Bạch Đằng Stake Yard",
    "year": "1288–nay",
    "yearStart": 1288,
    "yearEnd": 2025,
    "type": "heritage",
    "lng": 106.75,
    "lat": 20.95,
    "province": "Quảng Ninh",
    "summary": "Di tích bãi cọc gỗ lim đóng dưới lòng sông trong trận Bạch Đằng 1288, bằng chứng khảo cổ cho chiến thuật thiên tài của Trần Hưng Đạo.",
    "neighbors": [
      {
        "node": {
          "name": "Trận Bạch Đằng",
          "id": "bach_dang_1288",
          "type": "battle"
        },
        "relation": "COMMEMORATES",
        "direction": "out"
      }
    ]
  },
  {
    "id": "hoang_thanh_thang_long",
    "name": "Hoàng thành Thăng Long",
    "nameEn": "Imperial Citadel of Thăng Long",
    "year": "1010–nay",
    "yearStart": 1010,
    "yearEnd": 2025,
    "type": "heritage",
    "lng": 105.84,
    "lat": 21.035,
    "province": "Hà Nội",
    "summary": "Trung tâm quyền lực Đại Việt qua nhiều triều đại trong đó có nhà Trần; Di sản Văn hoá Thế giới UNESCO 2010.",
    "neighbors": [
      {
        "node": {
          "name": "Thăng Long",
          "id": "thang_long",
          "type": "capital"
        },
        "relation": "PART_OF",
        "direction": "out"
      }
    ]
  }
];

export const FALLBACK_OVERVIEW = [
  {
    "key": "battle",
    "value": 6,
    "label": "Trận chiến"
  },
  {
    "key": "person",
    "value": 13,
    "label": "Nhân vật"
  },
  {
    "key": "event",
    "value": 5,
    "label": "Sự kiện"
  },
  {
    "key": "heritage",
    "value": 7,
    "label": "Di sản & Kinh đô"
  },
  {
    "key": "relation",
    "value": 72,
    "label": "Quan hệ"
  }
];

export const FALLBACK_TIMELINE = [
  {
    "id": "khang_chien_1",
    "name": "Kháng chiến lần 1",
    "type": "event",
    "year": "1258",
    "yearStart": 1258,
    "yearEnd": 1258,
    "mapPoint": false,
    "summary": "Cuộc kháng chiến chống quân Nguyên–Mông lần thứ nhất, đỉnh cao là trận Đông Bộ Đầu giải phóng Thăng Long."
  },
  {
    "id": "dong_bo_dau_1258",
    "name": "Trận Đông Bộ Đầu",
    "type": "battle",
    "year": "1258",
    "yearStart": 1258,
    "yearEnd": 1258,
    "lat": 21.043,
    "lng": 105.852,
    "mapPoint": true,
    "summary": "Trận phản công đêm giải phóng kinh thành Thăng Long, kết thúc thắng lợi cuộc kháng chiến lần thứ nhất (1258)."
  },
  {
    "id": "hoi_nghi_binh_than",
    "name": "Hội nghị Bình Than",
    "type": "event",
    "year": "1282",
    "yearStart": 1282,
    "yearEnd": 1282,
    "lat": 21.05,
    "lng": 106.2,
    "mapPoint": true,
    "summary": "Hội nghị quân sự các vương hầu bàn kế chống giặc; nơi Trần Quốc Toản bóp nát quả cam vì còn nhỏ không được dự."
  },
  {
    "id": "hoi_nghi_dien_hong",
    "name": "Hội nghị Diên Hồng",
    "type": "event",
    "year": "1284",
    "yearStart": 1284,
    "yearEnd": 1284,
    "lat": 21.03,
    "lng": 105.84,
    "mapPoint": true,
    "summary": "Thái thượng hoàng Trần Thánh Tông mời các bô lão cả nước hỏi kế đánh hay hoà — tất cả đồng thanh \"Đánh!\". Biểu tượng của ý chí toàn dân."
  },
  {
    "id": "khang_chien_2",
    "name": "Kháng chiến lần 2",
    "type": "event",
    "year": "1285",
    "yearStart": 1285,
    "yearEnd": 1285,
    "mapPoint": false,
    "summary": "Cuộc kháng chiến chống 50 vạn quân Thoát Hoan, với các chiến thắng Hàm Tử, Chương Dương, Tây Kết."
  },
  {
    "id": "ham_tu_1285",
    "name": "Trận Hàm Tử",
    "type": "battle",
    "year": "1285",
    "yearStart": 1285,
    "yearEnd": 1285,
    "lat": 20.78,
    "lng": 105.97,
    "mapPoint": true,
    "summary": "Trần Nhật Duật chỉ huy đánh tan quân Nguyên ở cửa Hàm Tử, mở màn cho cuộc phản công chiến lược 1285."
  },
  {
    "id": "chuong_duong_1285",
    "name": "Trận Chương Dương",
    "type": "battle",
    "year": "1285",
    "yearStart": 1285,
    "yearEnd": 1285,
    "lat": 20.87,
    "lng": 105.86,
    "mapPoint": true,
    "summary": "Trần Quang Khải chỉ huy đánh chiếm bến Chương Dương, dọn đường tiến vào giải phóng Thăng Long."
  },
  {
    "id": "tay_ket_1285",
    "name": "Trận Tây Kết",
    "type": "battle",
    "year": "1285",
    "yearStart": 1285,
    "yearEnd": 1285,
    "lat": 20.75,
    "lng": 105.98,
    "mapPoint": true,
    "summary": "Quân Trần tiêu diệt cánh quân Toa Đô; chủ tướng Toa Đô bị chém đầu, khép lại cuộc kháng chiến lần 2."
  },
  {
    "id": "khang_chien_3",
    "name": "Kháng chiến lần 3",
    "type": "event",
    "year": "1287–1288",
    "yearStart": 1287,
    "yearEnd": 1288,
    "mapPoint": false,
    "summary": "Cuộc kháng chiến kết thúc bằng đại thắng Bạch Đằng 1288, đập tan hoàn toàn ý đồ xâm lược của nhà Nguyên."
  },
  {
    "id": "van_don_1287",
    "name": "Trận Vân Đồn",
    "type": "battle",
    "year": "1287",
    "yearStart": 1287,
    "yearEnd": 1287,
    "lat": 21.06,
    "lng": 107.42,
    "mapPoint": true,
    "summary": "Trần Khánh Dư tiêu diệt đoàn thuyền lương khổng lồ của Trương Văn Hổ — đòn hậu cần quyết định khiến quân Nguyên lâm vào cảnh đói."
  },
  {
    "id": "bach_dang_1288",
    "name": "Trận Bạch Đằng",
    "type": "battle",
    "year": "1288",
    "yearStart": 1288,
    "yearEnd": 1288,
    "lat": 20.92,
    "lng": 106.78,
    "mapPoint": true,
    "summary": "Đại thắng kinh điển: Trần Hưng Đạo dùng kế cắm cọc gỗ lợi dụng thuỷ triều, tiêu diệt và bắt sống toàn bộ thuỷ quân Nguyên, bắt Ô Mã Nhi."
  }
];

export const FALLBACK_FULL_GRAPH = {
  "nodes": [
    {
      "id": "hot_tat_liet",
      "name": "Hốt Tất Liệt",
      "nameEn": "Kublai Khan",
      "type": "enemy",
      "year": "1215–1294",
      "summary": "Hoàng đế khai sáng nhà Nguyên, người ra lệnh ba lần đem quân xâm lược Đại Việt nhằm mở đường xuống Đông Nam Á.",
      "mapPoint": false
    },
    {
      "id": "thoat_hoan",
      "name": "Thoát Hoan",
      "nameEn": "Toghan",
      "type": "enemy",
      "year": "TK XIII",
      "summary": "Con trai Hốt Tất Liệt, Trấn Nam Vương, tổng chỉ huy quân Nguyên trong hai lần xâm lược 1285 và 1288; phải chui ống đồng tháo chạy về nước.",
      "mapPoint": false
    },
    {
      "id": "o_ma_nhi",
      "name": "Ô Mã Nhi",
      "nameEn": "Omar",
      "type": "enemy",
      "year": "TK XIII",
      "summary": "Tướng thủy quân Nguyên, bị bắt sống trong trận Bạch Đằng 1288.",
      "mapPoint": false
    },
    {
      "id": "toa_do",
      "name": "Toa Đô",
      "nameEn": "Sogetu",
      "type": "enemy",
      "year": "TK XIII",
      "summary": "Tướng Nguyên đánh lên từ phía nam (Chiêm Thành), bị chém đầu trong trận Tây Kết 1285.",
      "mapPoint": false
    },
    {
      "id": "truong_van_ho",
      "name": "Trương Văn Hổ",
      "nameEn": "Zhang Wenhu",
      "type": "enemy",
      "year": "TK XIII",
      "summary": "Tướng chỉ huy đoàn thuyền lương Nguyên, bị Trần Khánh Dư đánh tan ở Vân Đồn (1287).",
      "mapPoint": false
    },
    {
      "id": "khang_chien_1",
      "name": "Kháng chiến lần 1",
      "nameEn": "First resistance war",
      "type": "event",
      "year": "1258",
      "summary": "Cuộc kháng chiến chống quân Nguyên–Mông lần thứ nhất, đỉnh cao là trận Đông Bộ Đầu giải phóng Thăng Long.",
      "mapPoint": false
    },
    {
      "id": "khang_chien_2",
      "name": "Kháng chiến lần 2",
      "nameEn": "Second resistance war",
      "type": "event",
      "year": "1285",
      "summary": "Cuộc kháng chiến chống 50 vạn quân Thoát Hoan, với các chiến thắng Hàm Tử, Chương Dương, Tây Kết.",
      "mapPoint": false
    },
    {
      "id": "khang_chien_3",
      "name": "Kháng chiến lần 3",
      "nameEn": "Third resistance war",
      "type": "event",
      "year": "1287–1288",
      "summary": "Cuộc kháng chiến kết thúc bằng đại thắng Bạch Đằng 1288, đập tan hoàn toàn ý đồ xâm lược của nhà Nguyên.",
      "mapPoint": false
    },
    {
      "id": "hoi_nghi_binh_than",
      "name": "Hội nghị Bình Than",
      "nameEn": "Bình Than Conference",
      "type": "event",
      "year": "1282",
      "province": "Bắc Ninh",
      "summary": "Hội nghị quân sự các vương hầu bàn kế chống giặc; nơi Trần Quốc Toản bóp nát quả cam vì còn nhỏ không được dự.",
      "mapPoint": true
    },
    {
      "id": "hoi_nghi_dien_hong",
      "name": "Hội nghị Diên Hồng",
      "nameEn": "Diên Hồng Conference",
      "type": "event",
      "year": "1284",
      "province": "Thăng Long",
      "summary": "Thái thượng hoàng Trần Thánh Tông mời các bô lão cả nước hỏi kế đánh hay hoà — tất cả đồng thanh \"Đánh!\". Biểu tượng của ý chí toàn dân.",
      "mapPoint": true
    },
    {
      "id": "dong_bo_dau_1258",
      "name": "Trận Đông Bộ Đầu",
      "nameEn": "Battle of Đông Bộ Đầu",
      "type": "battle",
      "year": "1258",
      "province": "Thăng Long",
      "summary": "Trận phản công đêm giải phóng kinh thành Thăng Long, kết thúc thắng lợi cuộc kháng chiến lần thứ nhất (1258).",
      "mapPoint": true
    },
    {
      "id": "ham_tu_1285",
      "name": "Trận Hàm Tử",
      "nameEn": "Battle of Hàm Tử",
      "type": "battle",
      "year": "1285",
      "province": "Hưng Yên",
      "summary": "Trần Nhật Duật chỉ huy đánh tan quân Nguyên ở cửa Hàm Tử, mở màn cho cuộc phản công chiến lược 1285.",
      "mapPoint": true
    },
    {
      "id": "chuong_duong_1285",
      "name": "Trận Chương Dương",
      "nameEn": "Battle of Chương Dương",
      "type": "battle",
      "year": "1285",
      "province": "Hà Nội",
      "summary": "Trần Quang Khải chỉ huy đánh chiếm bến Chương Dương, dọn đường tiến vào giải phóng Thăng Long.",
      "mapPoint": true
    },
    {
      "id": "tay_ket_1285",
      "name": "Trận Tây Kết",
      "nameEn": "Battle of Tây Kết",
      "type": "battle",
      "year": "1285",
      "province": "Hưng Yên",
      "summary": "Quân Trần tiêu diệt cánh quân Toa Đô; chủ tướng Toa Đô bị chém đầu, khép lại cuộc kháng chiến lần 2.",
      "mapPoint": true
    },
    {
      "id": "van_don_1287",
      "name": "Trận Vân Đồn",
      "nameEn": "Battle of Vân Đồn",
      "type": "battle",
      "year": "1287",
      "province": "Quảng Ninh",
      "summary": "Trần Khánh Dư tiêu diệt đoàn thuyền lương khổng lồ của Trương Văn Hổ — đòn hậu cần quyết định khiến quân Nguyên lâm vào cảnh đói.",
      "mapPoint": true
    },
    {
      "id": "bach_dang_1288",
      "name": "Trận Bạch Đằng",
      "nameEn": "Battle of Bạch Đằng (1288)",
      "type": "battle",
      "year": "1288",
      "province": "Quảng Ninh – Hải Phòng",
      "summary": "Đại thắng kinh điển: Trần Hưng Đạo dùng kế cắm cọc gỗ lợi dụng thuỷ triều, tiêu diệt và bắt sống toàn bộ thuỷ quân Nguyên, bắt Ô Mã Nhi.",
      "mapPoint": true
    },
    {
      "id": "thang_long",
      "name": "Thăng Long",
      "nameEn": "Thăng Long Citadel",
      "type": "capital",
      "year": "1010–nay",
      "province": "Hà Nội",
      "summary": "Kinh đô Đại Việt thời Trần; ba lần bị quân Nguyên chiếm rồi đều được quân dân nhà Trần giải phóng.",
      "mapPoint": true
    },
    {
      "id": "van_kiep",
      "name": "Vạn Kiếp",
      "nameEn": "Vạn Kiếp",
      "type": "capital",
      "year": "TK XIII",
      "province": "Hải Dương",
      "summary": "Đại bản doanh của Trần Hưng Đạo, căn cứ thuỷ – bộ trọng yếu án ngữ đường tiến quân của giặc về Thăng Long.",
      "mapPoint": true
    },
    {
      "id": "thien_truong",
      "name": "Phủ Thiên Trường",
      "nameEn": "Thiên Trường",
      "type": "capital",
      "year": "TK XIII",
      "province": "Nam Định",
      "summary": "Quê hương và \"kinh đô thứ hai\" của nhà Trần, nơi các Thái thượng hoàng lui về và là hậu phương vững chắc trong kháng chiến.",
      "mapPoint": true
    },
    {
      "id": "den_kiep_bac",
      "name": "Đền Kiếp Bạc",
      "nameEn": "Kiếp Bạc Temple",
      "type": "heritage",
      "year": "1300–nay",
      "province": "Hải Dương",
      "summary": "Đền thờ Hưng Đạo Đại Vương Trần Quốc Tuấn tại Vạn Kiếp, một trong những di tích thờ Trần Hưng Đạo lớn nhất cả nước.",
      "mapPoint": true
    },
    {
      "id": "den_tran_nam_dinh",
      "name": "Đền Trần (Nam Định)",
      "nameEn": "Trần Temple, Nam Định",
      "type": "heritage",
      "year": "1695–nay",
      "province": "Nam Định",
      "summary": "Khu đền thờ 14 vị vua Trần trên đất phát tích Thiên Trường, nổi tiếng với lễ Khai ấn đầu xuân.",
      "mapPoint": true
    },
    {
      "id": "bai_coc_bach_dang",
      "name": "Bãi cọc Bạch Đằng",
      "nameEn": "Bạch Đằng Stake Yard",
      "type": "heritage",
      "year": "1288–nay",
      "province": "Quảng Ninh",
      "summary": "Di tích bãi cọc gỗ lim đóng dưới lòng sông trong trận Bạch Đằng 1288, bằng chứng khảo cổ cho chiến thuật thiên tài của Trần Hưng Đạo.",
      "mapPoint": true
    },
    {
      "id": "hoang_thanh_thang_long",
      "name": "Hoàng thành Thăng Long",
      "nameEn": "Imperial Citadel of Thăng Long",
      "type": "heritage",
      "year": "1010–nay",
      "province": "Hà Nội",
      "summary": "Trung tâm quyền lực Đại Việt qua nhiều triều đại trong đó có nhà Trần; Di sản Văn hoá Thế giới UNESCO 2010.",
      "mapPoint": true
    },
    {
      "id": "hich_tuong_si",
      "name": "Hịch tướng sĩ",
      "nameEn": "Hịch tướng sĩ",
      "type": "artifact",
      "year": "1284",
      "summary": "Bài hịch bất hủ của Trần Hưng Đạo khích lệ tướng sĩ trước cuộc kháng chiến lần 2, áng văn chính luận tiêu biểu của văn học Việt Nam.",
      "mapPoint": false
    },
    {
      "id": "binh_thu_yeu_luoc",
      "name": "Binh thư yếu lược",
      "nameEn": "Binh thư yếu lược",
      "type": "artifact",
      "year": "TK XIII",
      "summary": "Bộ binh thư do Trần Hưng Đạo biên soạn, tổng kết nghệ thuật quân sự để huấn luyện tướng sĩ.",
      "mapPoint": false
    },
    {
      "id": "coc_go_bach_dang",
      "name": "Trận địa cọc Bạch Đằng",
      "nameEn": "Bạch Đằng stakes tactic",
      "type": "artifact",
      "year": "1288",
      "summary": "Chiến thuật đóng cọc gỗ bịt sắt dưới lòng sông, lợi dụng thuỷ triều lên xuống để nhấn chìm chiến thuyền địch.",
      "mapPoint": false
    },
    {
      "id": "nha_tran",
      "name": "Nhà Trần",
      "nameEn": "Trần Dynasty",
      "type": "dynasty",
      "year": "1225–1400",
      "summary": "Triều đại lãnh đạo Đại Việt ba lần đánh bại đế quốc Nguyên–Mông hùng mạnh nhất thế giới thế kỷ XIII, mở ra thời kỳ \"Hào khí Đông A\".",
      "mapPoint": false
    },
    {
      "id": "de_quoc_nguyen_mong",
      "name": "Đế quốc Nguyên – Mông",
      "nameEn": "Mongol–Yuan Empire",
      "type": "enemy",
      "year": "TK XIII",
      "summary": "Đế quốc lớn nhất lịch sử nhân loại tính theo lãnh thổ liền kề, ba lần đem đại quân xâm lược Đại Việt nhưng đều thất bại.",
      "mapPoint": false
    },
    {
      "id": "tran_thai_tong",
      "name": "Trần Thái Tông",
      "nameEn": "Trần Thái Tông",
      "type": "person",
      "year": "1218–1277",
      "summary": "Vị vua khai sáng nhà Trần, trực tiếp cầm quân trong cuộc kháng chiến chống Nguyên–Mông lần thứ nhất (1258).",
      "mapPoint": false
    },
    {
      "id": "tran_thanh_tong",
      "name": "Trần Thánh Tông",
      "nameEn": "Trần Thánh Tông",
      "type": "person",
      "year": "1240–1290",
      "summary": "Làm Thái thượng hoàng, cùng vua Trần Nhân Tông lãnh đạo hai cuộc kháng chiến 1285 và 1288.",
      "mapPoint": false
    },
    {
      "id": "tran_nhan_tong",
      "name": "Trần Nhân Tông",
      "nameEn": "Trần Nhân Tông",
      "type": "person",
      "year": "1258–1308",
      "summary": "Vị vua anh minh lãnh đạo kháng chiến lần 2 (1285) và lần 3 (1288); sau xuất gia, sáng lập Thiền phái Trúc Lâm Yên Tử.",
      "mapPoint": false
    },
    {
      "id": "tran_hung_dao",
      "name": "Trần Hưng Đạo",
      "nameEn": "Trần Hưng Đạo (Trần Quốc Tuấn)",
      "type": "person",
      "year": "1228–1300",
      "summary": "Hưng Đạo Đại Vương Trần Quốc Tuấn — Quốc công Tiết chế, tổng chỉ huy quân đội, kiến trúc sư chiến thắng Bạch Đằng 1288. Tác giả \"Hịch tướng sĩ\".",
      "mapPoint": false
    },
    {
      "id": "tran_quang_khai",
      "name": "Trần Quang Khải",
      "nameEn": "Trần Quang Khải",
      "type": "person",
      "year": "1241–1294",
      "summary": "Thượng tướng Thái sư, chỉ huy chiến thắng Chương Dương 1285, tác giả câu thơ \"Đoạt sáo Chương Dương độ\".",
      "mapPoint": false
    },
    {
      "id": "tran_nhat_duat",
      "name": "Trần Nhật Duật",
      "nameEn": "Trần Nhật Duật",
      "type": "person",
      "year": "1255–1330",
      "summary": "Chiêu Văn Vương, vị tướng đa tài, chỉ huy chiến thắng Hàm Tử 1285, nổi tiếng am hiểu ngôn ngữ và văn hoá các dân tộc.",
      "mapPoint": false
    },
    {
      "id": "tran_quoc_toan",
      "name": "Trần Quốc Toản",
      "nameEn": "Trần Quốc Toản",
      "type": "person",
      "year": "1267–1285",
      "summary": "Hoài Văn Hầu, thiếu niên anh hùng bóp nát quả cam vì không được dự bàn việc nước, giương cờ \"Phá cường địch, báo hoàng ân\".",
      "mapPoint": false
    },
    {
      "id": "tran_binh_trong",
      "name": "Trần Bình Trọng",
      "nameEn": "Trần Bình Trọng",
      "type": "person",
      "year": "1259–1285",
      "summary": "Vị tướng hy sinh ở Thiên Mạc, để lại khí phách \"Ta thà làm quỷ nước Nam, chứ không thèm làm vương đất Bắc\".",
      "mapPoint": false
    },
    {
      "id": "tran_khanh_du",
      "name": "Trần Khánh Dư",
      "nameEn": "Trần Khánh Dư",
      "type": "person",
      "year": "1240–1340",
      "summary": "Phó tướng trấn giữ Vân Đồn, tiêu diệt đoàn thuyền lương của Trương Văn Hổ — đòn quyết định khiến quân Nguyên thiếu lương.",
      "mapPoint": false
    },
    {
      "id": "tran_thu_do",
      "name": "Trần Thủ Độ",
      "nameEn": "Trần Thủ Độ",
      "type": "person",
      "year": "1194–1264",
      "summary": "Thái sư khai quốc nhà Trần, người để lại câu nói bất hủ trong kháng chiến lần 1: \"Đầu thần chưa rơi xuống đất, xin bệ hạ đừng lo\".",
      "mapPoint": false
    },
    {
      "id": "pham_ngu_lao",
      "name": "Phạm Ngũ Lão",
      "nameEn": "Phạm Ngũ Lão",
      "type": "person",
      "year": "1255–1320",
      "summary": "Tướng tài xuất thân bình dân, gia tướng và con rể Trần Hưng Đạo, nổi tiếng với giai thoại \"ngồi đan sọt giữa đường mải nghĩ việc nước\".",
      "mapPoint": false
    },
    {
      "id": "yet_kieu",
      "name": "Yết Kiêu",
      "nameEn": "Yết Kiêu",
      "type": "person",
      "year": "1242–1303",
      "summary": "Gia tướng của Trần Hưng Đạo, tài bơi lặn phi thường, đục thủng thuyền giặc dưới nước.",
      "mapPoint": false
    },
    {
      "id": "da_tuong",
      "name": "Dã Tượng",
      "nameEn": "Dã Tượng",
      "type": "person",
      "year": "TK XIII",
      "summary": "Gia tướng trung thành của Trần Hưng Đạo, nổi tiếng dũng mãnh và mưu trí trong các trận đánh.",
      "mapPoint": false
    }
  ],
  "links": [
    {
      "source": "tran_thai_tong",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_thanh_tong",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_nhan_tong",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_hung_dao",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_quang_khai",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_nhat_duat",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_quoc_toan",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_binh_trong",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_khanh_du",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "tran_thu_do",
      "target": "nha_tran",
      "relation": "BELONGS_TO"
    },
    {
      "source": "pham_ngu_lao",
      "target": "nha_tran",
      "relation": "SERVED"
    },
    {
      "source": "yet_kieu",
      "target": "tran_hung_dao",
      "relation": "SERVED"
    },
    {
      "source": "da_tuong",
      "target": "tran_hung_dao",
      "relation": "SERVED"
    },
    {
      "source": "pham_ngu_lao",
      "target": "tran_hung_dao",
      "relation": "SERVED"
    },
    {
      "source": "tran_thai_tong",
      "target": "thang_long",
      "relation": "RULED_FROM"
    },
    {
      "source": "tran_nhan_tong",
      "target": "thang_long",
      "relation": "RULED_FROM"
    },
    {
      "source": "nha_tran",
      "target": "thang_long",
      "relation": "CAPITAL_AT"
    },
    {
      "source": "nha_tran",
      "target": "thien_truong",
      "relation": "ORIGINATED_FROM"
    },
    {
      "source": "nha_tran",
      "target": "khang_chien_1",
      "relation": "FOUGHT"
    },
    {
      "source": "nha_tran",
      "target": "khang_chien_2",
      "relation": "FOUGHT"
    },
    {
      "source": "nha_tran",
      "target": "khang_chien_3",
      "relation": "FOUGHT"
    },
    {
      "source": "khang_chien_1",
      "target": "de_quoc_nguyen_mong",
      "relation": "AGAINST"
    },
    {
      "source": "khang_chien_2",
      "target": "de_quoc_nguyen_mong",
      "relation": "AGAINST"
    },
    {
      "source": "khang_chien_3",
      "target": "de_quoc_nguyen_mong",
      "relation": "AGAINST"
    },
    {
      "source": "hot_tat_liet",
      "target": "de_quoc_nguyen_mong",
      "relation": "RULED"
    },
    {
      "source": "dong_bo_dau_1258",
      "target": "khang_chien_1",
      "relation": "PART_OF"
    },
    {
      "source": "ham_tu_1285",
      "target": "khang_chien_2",
      "relation": "PART_OF"
    },
    {
      "source": "chuong_duong_1285",
      "target": "khang_chien_2",
      "relation": "PART_OF"
    },
    {
      "source": "tay_ket_1285",
      "target": "khang_chien_2",
      "relation": "PART_OF"
    },
    {
      "source": "van_don_1287",
      "target": "khang_chien_3",
      "relation": "PART_OF"
    },
    {
      "source": "bach_dang_1288",
      "target": "khang_chien_3",
      "relation": "PART_OF"
    },
    {
      "source": "tran_thai_tong",
      "target": "dong_bo_dau_1258",
      "relation": "COMMANDED"
    },
    {
      "source": "tran_thu_do",
      "target": "khang_chien_1",
      "relation": "ADVISED"
    },
    {
      "source": "tran_nhat_duat",
      "target": "ham_tu_1285",
      "relation": "COMMANDED"
    },
    {
      "source": "tran_quang_khai",
      "target": "chuong_duong_1285",
      "relation": "COMMANDED"
    },
    {
      "source": "tran_quoc_toan",
      "target": "chuong_duong_1285",
      "relation": "FOUGHT_IN"
    },
    {
      "source": "tran_hung_dao",
      "target": "tay_ket_1285",
      "relation": "COMMANDED"
    },
    {
      "source": "tran_khanh_du",
      "target": "van_don_1287",
      "relation": "COMMANDED"
    },
    {
      "source": "tran_hung_dao",
      "target": "bach_dang_1288",
      "relation": "COMMANDED"
    },
    {
      "source": "tran_nhan_tong",
      "target": "bach_dang_1288",
      "relation": "LED"
    },
    {
      "source": "tran_thanh_tong",
      "target": "bach_dang_1288",
      "relation": "LED"
    },
    {
      "source": "yet_kieu",
      "target": "bach_dang_1288",
      "relation": "FOUGHT_IN"
    },
    {
      "source": "da_tuong",
      "target": "bach_dang_1288",
      "relation": "FOUGHT_IN"
    },
    {
      "source": "pham_ngu_lao",
      "target": "bach_dang_1288",
      "relation": "FOUGHT_IN"
    },
    {
      "source": "dong_bo_dau_1258",
      "target": "thang_long",
      "relation": "LOCATED_AT"
    },
    {
      "source": "bach_dang_1288",
      "target": "van_kiep",
      "relation": "STAGED_FROM"
    },
    {
      "source": "bach_dang_1288",
      "target": "o_ma_nhi",
      "relation": "CAPTURED"
    },
    {
      "source": "bach_dang_1288",
      "target": "thoat_hoan",
      "relation": "DEFEATED"
    },
    {
      "source": "tay_ket_1285",
      "target": "toa_do",
      "relation": "DEFEATED"
    },
    {
      "source": "van_don_1287",
      "target": "truong_van_ho",
      "relation": "DEFEATED"
    },
    {
      "source": "thoat_hoan",
      "target": "de_quoc_nguyen_mong",
      "relation": "GENERAL_OF"
    },
    {
      "source": "o_ma_nhi",
      "target": "de_quoc_nguyen_mong",
      "relation": "GENERAL_OF"
    },
    {
      "source": "toa_do",
      "target": "de_quoc_nguyen_mong",
      "relation": "GENERAL_OF"
    },
    {
      "source": "truong_van_ho",
      "target": "de_quoc_nguyen_mong",
      "relation": "GENERAL_OF"
    },
    {
      "source": "hot_tat_liet",
      "target": "khang_chien_2",
      "relation": "ORDERED"
    },
    {
      "source": "hot_tat_liet",
      "target": "khang_chien_3",
      "relation": "ORDERED"
    },
    {
      "source": "tran_quoc_toan",
      "target": "hoi_nghi_binh_than",
      "relation": "RELATED_TO"
    },
    {
      "source": "tran_thanh_tong",
      "target": "hoi_nghi_dien_hong",
      "relation": "CONVENED"
    },
    {
      "source": "hoi_nghi_dien_hong",
      "target": "khang_chien_2",
      "relation": "PRECEDED"
    },
    {
      "source": "hoi_nghi_binh_than",
      "target": "khang_chien_2",
      "relation": "PRECEDED"
    },
    {
      "source": "tran_hung_dao",
      "target": "hich_tuong_si",
      "relation": "AUTHORED"
    },
    {
      "source": "tran_hung_dao",
      "target": "binh_thu_yeu_luoc",
      "relation": "AUTHORED"
    },
    {
      "source": "hich_tuong_si",
      "target": "khang_chien_2",
      "relation": "INSPIRED"
    },
    {
      "source": "tran_hung_dao",
      "target": "coc_go_bach_dang",
      "relation": "DEVISED"
    },
    {
      "source": "coc_go_bach_dang",
      "target": "bach_dang_1288",
      "relation": "USED_IN"
    },
    {
      "source": "den_kiep_bac",
      "target": "tran_hung_dao",
      "relation": "COMMEMORATES"
    },
    {
      "source": "den_kiep_bac",
      "target": "van_kiep",
      "relation": "LOCATED_AT"
    },
    {
      "source": "den_tran_nam_dinh",
      "target": "nha_tran",
      "relation": "COMMEMORATES"
    },
    {
      "source": "den_tran_nam_dinh",
      "target": "thien_truong",
      "relation": "LOCATED_AT"
    },
    {
      "source": "bai_coc_bach_dang",
      "target": "bach_dang_1288",
      "relation": "COMMEMORATES"
    },
    {
      "source": "hoang_thanh_thang_long",
      "target": "thang_long",
      "relation": "PART_OF"
    },
    {
      "source": "tran_binh_trong",
      "target": "khang_chien_2",
      "relation": "FOUGHT_IN"
    }
  ]
};
