import React, { useEffect } from 'react';

export default function Main() {
    useEffect(() => {
        const form = document.getElementById('login-form');
        const errorMessage = document.getElementById('error-message');
        const registerBtn = document.getElementById('register-btn');

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!form) return;
            if (errorMessage) errorMessage.style.display = 'none';

            const formData = new FormData(form);
            const username = formData.get('username')?.toString().trim() || '';
            const password = formData.get('password')?.toString() || '';

            try {
                const res = await fetch('http://localhost:8080/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                let data;
                try {
                    data = await res.json();
                } catch {
                    if (errorMessage) {
                        errorMessage.textContent = 'Invalid server response';
                        errorMessage.style.display = 'block';
                    }
                    return;
                }

                if (!res.ok) {
                    const errMsg = data.error || 'Login failed';
                    if (errorMessage) {
                        errorMessage.textContent = errMsg;
                        errorMessage.style.display = 'block';
                    }
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);

                if (data.role === 'admin') {
                    window.location.href = '/index.html';
                } else {
                    window.location.href = '/interface/user.html';
                }
            } catch {
                if (errorMessage) {
                    errorMessage.textContent = 'Network error';
                    errorMessage.style.display = 'block';
                }
            }
        };

        const handleRegister = () => {
            window.location.href = '/interface/register.html';
        };

        form?.addEventListener('submit', handleSubmit);
        registerBtn?.addEventListener('click', handleRegister);

        return () => {
            form?.removeEventListener('submit', handleSubmit);
            registerBtn?.removeEventListener('click', handleRegister);
        };
    }, []);

    return null;
}
