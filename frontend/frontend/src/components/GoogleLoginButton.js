// src/components/GoogleLoginButton.js
import { useEffect } from "react";

const GoogleLoginButton = () => {
  useEffect(() => {
    /* global google */
    window.google?.accounts.id.initialize({
      client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your Client ID
      callback: handleCredentialResponse,
    });

    window.google?.accounts.id.renderButton(
      document.getElementById("google-signin-button"),
      {
        theme: "outline",
        size: "large",
        width: "100%",
      }
    );
  }, []);

  const handleCredentialResponse = (response) => {
    // Send response.credential (JWT token) to your backend for verification
    console.log("Encoded JWT ID token: " + response.credential);
  };

  return <div id="google-signin-button" className="my-4" />;
};

export default GoogleLoginButton;
