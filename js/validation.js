// Validation Form 1: Đăng ký thông tin thí sinh / Tạo câu hỏi (admin.html)
const candidateForm = document.getElementById('candidateForm');

if (candidateForm) {
  candidateForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn gửi form

    let isValid = true;

    const name = document.getElementById('fullname');
    const email = document.getElementById('email');
    const sbd = document.getElementById('sbd');
    const password = document.getElementById('password');
    const subjectSelect = document.getElementById('subjectSelect');

    function setError(input, msg) {
      const group = input.parentElement;
      const err = group.querySelector('.error-message');
      if (err) err.textContent = msg;
      isValid = false;
    }

    function clearError(input) {
      const group = input.parentElement;
      const err = group.querySelector('.error-message');
      if (err) err.textContent = '';
    }

    // 1. Kiểm tra Họ tên
    if (name.value.trim() === '') setError(name, 'Vui lòng nhập họ tên thí sinh!');
    else clearError(name);

    // 2. Kiểm tra Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) setError(email, 'Email không hợp lệ!');
    else clearError(email);

    // 3. Kiểm tra SBD (số)
    if (sbd.value.trim() === '' || isNaN(sbd.value)) setError(sbd, 'SBD phải là chuỗi số!');
    else clearError(sbd);

    // 4. Kiểm tra Mật khẩu (>= 6 ký tự)
    if (password.value.length < 6) setError(password, 'Mật khẩu phải từ 6 ký tự!');
    else clearError(password);

    // 5. Kiểm tra Select Môn
    if (subjectSelect.value === '') setError(subjectSelect, 'Vui lòng chọn môn đăng ký!');
    else clearError(subjectSelect);

    if (isValid) {
      const alertBox = document.getElementById('successAlert');
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.textContent = 'Đăng ký thông tin dự thi thành công!';
      }
      candidateForm.reset();
    }
  });
}