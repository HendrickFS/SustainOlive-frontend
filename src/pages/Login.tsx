import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fontsource/inter/600.css";
import { Button, Card, Checkbox, Form, Input, Space, Typography, message, Alert, Modal } from "antd";
import { useAuth } from "../contexts/AuthContext";
// Firestore removed: no imports from "firebase/firestore" or `db`.
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

import oliveOilImg from "../assets/azeite_app.png";
import azeiteImg from "../assets/azeite.jpg";
import sustainoliveLogo from "../assets/pegada.png";
import ipbLogo from "../assets/ipbLogo.png";

export function Login() {
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isFirstTimeModal, setIsFirstTimeModal] = useState(false);
    const [firstTimeEmail, setFirstTimeEmail] = useState("");
    const [creatingAccount, setCreatingAccount] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [passwordForm] = Form.useForm();

    // Firestore checks removed — not using Firestore anymore.

    const handleCreatePassword = async (values: { password: string; confirmPassword: string }) => {
        setCreatingAccount(true);
        try {
            // Create Firebase Auth account
            await createUserWithEmailAndPassword(auth, firstTimeEmail, values.password);
            message.success("Account created successfully! Please log in.");
            setIsFirstTimeModal(false);
            passwordForm.resetFields();
            setFirstTimeEmail("");
        } catch (error: any) {
            console.error("Error creating account:", error);
            if (error.code === "auth/email-already-in-use") {
                message.error("An account with this email already exists. Please try logging in.");
                setIsFirstTimeModal(false);
            } else if (error.code === "auth/weak-password") {
                message.error("Password is too weak. Please use a stronger password.");
            } else {
                message.error("Failed to create account. Please try again.");
            }
        } finally {
            setCreatingAccount(false);
        }
    };

    const onFinish = async (values: { email: string; password: string; remember?: boolean }) => {
        setSubmitting(true);
        setErrorMessage(""); // Clear previous errors
        try {
            await login(values.email, values.password);
            message.success("Welcome back!");
            navigate("/home");
        } catch (error: any) {
            // Handle Firebase errors
            const errorCode = error?.code;
            let errorMsg = "";
            
            if (errorCode === "auth/user-not-found" || errorCode === "auth/invalid-credential") {
                // No Firestore check available; treat as no account found in Auth
                errorMsg = "No account found with this email address. Please contact your administrator.";
                message.error(errorMsg);
                setErrorMessage(errorMsg);
            } else if (errorCode === "auth/wrong-password") {
                errorMsg = "Incorrect password. Please try again.";
                message.error(errorMsg);
                setErrorMessage(errorMsg);
            } else if (errorCode === "auth/invalid-email") {
                errorMsg = "Invalid email format";
                message.error(errorMsg);
                setErrorMessage(errorMsg);
            } else if (errorCode === "auth/too-many-requests") {
                errorMsg = "Too many failed attempts. Please try again later.";
                message.error(errorMsg);
                setErrorMessage(errorMsg);
            } else {
                errorMsg = "Login failed. Please check your credentials and try again.";
                message.error(errorMsg);
                setErrorMessage(errorMsg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const onFinishFailed = () => {
        message.warning("Please fix the errors in the form");
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "#f0f2f5",
            }}
        >
            <img
                src={oliveOilImg}
                alt="Olive oil app"
                style={{
                    width: "50%",
                    height: "100%",
                    objectFit: "cover",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
            />

            <div
                style={{ position: "relative", width: "50%", height: "100vh", overflow: "hidden" }}
            >
                        <img
                    src={azeiteImg}
                    alt="Background"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                                filter: "blur(4px) brightness(0.6)",
                        zIndex: 0,
                        scale: "1.4",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                        color: "#fff",
                    }}
                >
                    <div style={{ marginBottom: "auto" }} />

                    <img src={sustainoliveLogo} alt="Sustainolive Logo" style={{ width: 240, marginBottom: 16 }} />

                                <Card
                        style={{
                            width: "90%",
                            maxWidth: 420,
                                        background: "rgba(255,255,255,0.18)",
                                        backdropFilter: "blur(12px) saturate(180%)",
                                        WebkitBackdropFilter: "blur(12px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.35)",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }} size="large">
                            <Typography.Title level={3} style={{ margin: 0, textAlign: "center", color: "#fff" }}>
                                Login
                            </Typography.Title>
                            
                            {errorMessage && (
                                <Alert
                                    message={errorMessage}
                                    type="error"
                                    showIcon
                                    closable
                                    onClose={() => setErrorMessage("")}
                                    style={{ marginBottom: 0 }}
                                />
                            )}
                            
                            <Form
                                layout="vertical"
                                name="login"
                                requiredMark={false}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="on"
                            >
                                                <Form.Item
                                                    label={<span style={{ color: "#fff" }}>Email</span>}
                                                    name="email"
                                                    rules={[
                                                        { required: true, message: "Please input your email" },
                                                        { type: "email", message: "Enter a valid email" },
                                                    ]}
                                                >
                                    <Input placeholder="you@example.com" inputMode="email" />
                                </Form.Item>
                                                <Form.Item
                                                    label={<span style={{ color: "#fff" }}>Password</span>}
                                                    name="password"
                                                    rules={[
                                                        { required: true, message: "Please input your password" },
                                                        { min: 6, message: "Password must be at least 6 characters" },
                                                    ]}
                                                >
                                    <Input.Password placeholder="••••••••" />
                                </Form.Item>
                                <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 8 }}>
                                    <Checkbox style={{ color: "#fff" }}>Remember me</Checkbox>
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        loading={submitting}
                                        style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
                                    >
                                        Log in
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Space>
                    </Card>

                    <img src={ipbLogo} alt="IPB Logo" style={{ width: 200, marginTop: "auto", marginBottom: 24 }} />
                </div>
            </div>

            {/* First-time user password setup modal */}
            <Modal
                title="Welcome! Set Your Password"
                open={isFirstTimeModal}
                onCancel={() => {
                    setIsFirstTimeModal(false);
                    passwordForm.resetFields();
                    setFirstTimeEmail("");
                }}
                footer={null}
                width={400}
            >
                <p style={{ marginBottom: 20 }}>
                    This is your first time logging in. Please create a password for your account: <strong>{firstTimeEmail}</strong>
                </p>
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleCreatePassword}
                >
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: "Please input your password" },
                            { min: 6, message: "Password must be at least 6 characters" },
                        ]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: "Please confirm your password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm your password" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={creatingAccount}
                            style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
                        >
                            Create Password & Login
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}