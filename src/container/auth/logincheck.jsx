import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decryptKeyNormal } from "../../utils/validation";

function LoginCheck() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserData = localStorage.getItem("userAuth");

        if (checkUserData) {
            const userData = JSON.parse(checkUserData);

            if (userData && decryptKeyNormal(userData.isAuthenticated)) {
                console.log("User is authenticated, navigating to dashboard...");
                navigate(`${import.meta.env.BASE_URL}dashboard`);
            } else {
                console.log("User data found but invalid, navigating to sign-in...");
                navigate(`${import.meta.env.BASE_URL}auth/signin/`);
            }
        } else {
            console.log("No user data found, navigating to sign-in...");
            navigate(`${import.meta.env.BASE_URL}auth/signin/`);
        }
    }, [navigate]); // Ensure `navigate` is included as a dependency

    return null; // Component does not render any UI
}

export default LoginCheck;
