import React from 'react';

type LoginPageProps = {
    onLogin: () => void;
};

const Login: React.FC<LoginPageProps> = ({ onLogin }) => (
    <button className="spotify-btn btn-pos" onClick={onLogin}>
        Login with Spotify
    </button>
    );

export default Login;