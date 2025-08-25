import React, { useState } from 'react';
import { buildApiUrl } from '../config/api';

function Login({ onLogin, onSwitchToRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(buildApiUrl('/api/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                setError('Usuário ou senha inválidos');
                return;
            }

            const data = await res.json();
            onLogin(data);
            setError('');
        } catch (err) {
            setError('Erro no servidor');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuário</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                            placeholder="Digite seu usuário"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Digite sua senha"
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Entrar
                    </button>
                </form>

                <div className="form-footer">
                    <button
                        type="button"
                        className="switch-btn"
                        onClick={onSwitchToRegister}
                    >
                        Não tem uma conta? Cadastre-se
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}

export default Login; 