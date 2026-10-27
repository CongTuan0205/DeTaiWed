document.addEventListener("DOMContentLoaded", function () {
  // 1. Đồng hồ thời gian thực
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("vi-VN");
      const dateStr = now.toLocaleDateString("vi-VN");
      clockEl.textContent = `${timeStr} - ${dateStr}`;
    }, 1000);
  }

  // 2. Chuyển đổi giao diện Sáng / Tối (Dark mode)
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  }

  // 3. [BỔ SUNG MỚI] Đồng bộ hóa trạng thái đăng nhập & phân quyền trên Header + Navigation Menu
  syncUserAuthNavigation();
});

function syncUserAuthNavigation() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // 3.1 Cập nhật thông tin User trên Top Header Banner
  const headerTools = document.querySelector(".header-tools");
  if (headerTools) {
    let userBox = document.getElementById("userHeaderStatus");
    if (!userBox) {
      userBox = document.createElement("div");
      userBox.id = "userHeaderStatus";
      userBox.style.cssText = "display: inline-flex; align-items: center; gap: 10px; margin-right: 12px; font-size: 0.95rem; vertical-align: middle;";
      const clockElem = document.getElementById("clock");
      headerTools.insertBefore(userBox, clockElem);
    }

    if (currentUser) {
      userBox.innerHTML = `
        <span style="color: #ffeb3b; font-weight: 500;">👤 ${currentUser.fullname || currentUser.email}</span>
        <button id="btnLogoutHeader" style="background: #e53935; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: bold;">Đăng xuất</button>
      `;

      document.getElementById("btnLogoutHeader").addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        alert("Đã đăng xuất tài khoản thành công!");
        window.location.href = "login.html";
      });
    } else {
      userBox.innerHTML = `
        <a href="login.html" style="color: #fff; text-decoration: none; background: rgba(255, 255, 255, 0.2); padding: 5px 12px; border-radius: 4px; font-size: 0.9rem; font-weight: 500;">Đăng nhập</a>
      `;
    }
  }

  // 3.2 [BỔ SUNG MỚI] Ẩn/Hiện Menu Admin ("Quản lý câu hỏi") dựa trên phân quyền
  const adminNavItems = document.querySelectorAll('nav a[href="admin.html"]');
  adminNavItems.forEach(link => {
    const parentLi = link.parentElement;
    if (currentUser && (currentUser.isAdmin || currentUser.email === "admin@CongTuan")) {
      parentLi.style.display = "block";
    } else {
      parentLi.style.display = "none"; // Ẩn nếu không phải Admin
    }
  });

  // 3.3 [BỔ SUNG MỚI] Đổi tên tab "Tài khoản" thành tên người dùng nếu đã đăng nhập
  const accountNavLinks = document.querySelectorAll('nav a[href="login.html"]');
  accountNavLinks.forEach(link => {
    if (currentUser) {
      link.textContent = `👤 ${currentUser.firstname || 'Tài khoản'}`;
    } else {
      link.textContent = "Tài khoản";
    }
  });
}