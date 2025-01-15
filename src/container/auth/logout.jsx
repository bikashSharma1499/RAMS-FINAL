import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HandleLogOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear session data
        localStorage.removeItem("userAuth");
        localStorage.removeItem("userKey");
        localStorage.removeItem("next_step");
        localStorage.removeItem("otpUser");
        localStorage.removeItem("rentOtp");
        localStorage.removeItem("rg_rcd");
        localStorage.removeItem("userType");

        // Redirect to login check page
        navigate(`${import.meta.env.BASE_URL}auth/logincheck`);
    }, [navigate]);

    return null; // No UI needed for this page
};

export default HandleLogOut;
