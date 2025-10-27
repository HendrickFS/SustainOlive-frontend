import { useEffect, useState } from "react";
import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { Card, Button, Modal, Checkbox, message, Spin } from "antd";
import { BellOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { getModels } from "../api/modelApi";
import type { Model } from "../api/modelApi";
import { formatName } from "../utils/formatting";
import { getAllUsers, getCurrentUser, saveUserAlertConfig } from "../api/usersApi";

interface UserData {
  uid?: string;
  id?: number;
  email: string;
  name?: string;
  role?: string;
  selectedDevices?: string[];
}

interface ModelOption {
  id: string;
  name: string;
}

export const AlertsConfigPage = () => {
  const auth = useAuth();
  const user = auth.user;
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("user");

  useEffect(() => {
    fetchUsers();
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const modelsData = await getModels();
      const models: ModelOption[] = modelsData.map((model: Model) => ({
        id: model.thingId,
        name: formatName(model.thingId),
      }));
      setAvailableModels(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      message.error("Failed to load models from API");
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
  const token = (auth as any)?.token ?? null;
      if (!token) {
        message.warning("User not logged in");
        setLoading(false);
        return;
      }

      // Determine current user's role (prefer client value, fallback to API)
      let role = (user as any)?.role || undefined;
      if (!role) {
        try {
          const me = await getCurrentUser(token);
          role = me.role || 'user';
          setCurrentUserRole(role);
        } catch (err) {
          role = 'user';
        }
      } else {
        setCurrentUserRole(role);
      }

      let fetchedUsers: UserData[] = [];
      if (role === 'admin') {
        const usersList = await getAllUsers(token);
        fetchedUsers = usersList.map((u) => ({
          uid: String(u.id),
          id: u.id,
          email: u.email,
          name: u.displayName ?? u.name ?? '',
          role: u.role ?? 'user',
          selectedDevices: u.selectedDevices ?? [],
        }));
      } else {
        const me = await getCurrentUser(token);
        fetchedUsers = [{
          uid: String(me.id),
          id: me.id,
          email: me.email,
          name: me.displayName ?? me.name ?? '',
          role: me.role ?? 'user',
          selectedDevices: me.selectedDevices ?? [],
        }];
      }

      setUsers(fetchedUsers);
      if (fetchedUsers.length === 0) message.info('No users found');
      } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users from API");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureAlerts = async (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setLoadingConfig(true);
    
    try {
      // Use the passed-in selectedDevices
      setSelectedModels(user.selectedDevices || []);
    } catch (error) {
      console.error("Error loading alert config:", error);
      setSelectedModels([]);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSaveConfig = async () => {
    if (!selectedUser || !selectedUser.id) return;

    setSavingConfig(true);
    try {
      const token = (auth as any).token;
      if (!token) throw new Error('Not authenticated');
      await saveUserAlertConfig(token, selectedUser.id, selectedUser.email, { selectedModels });

      message.success(`Alert configuration saved for ${selectedUser.email}`);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, selectedDevices: selectedModels } : u));

      setIsModalOpen(false);
      setSelectedUser(null);
      setSelectedModels([]);
    } catch (error) {
      console.error("Error saving alert config:", error);
      message.error("Failed to save configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Menu />
      <div
        style={{
          width: "85%",
          height: "100vh",
          overflow: "auto",
          backgroundColor: "#fff",
        }}
      >
        <PageHeader
          title="Alert Configuration"
          description={
            currentUserRole === "admin"
              ? "Configure email alert subscriptions for each user. Select which models should trigger email notifications."
              : "Configure your email alert subscriptions. Select which models should trigger email notifications."
          }
          icon={<BellOutlined />}
        />

        <div style={{ padding: "24px 40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {users.map((user) => (
              <Card
                key={user.uid}
                style={{
                  backgroundColor: "#fafafa",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
                hoverable
                bodyStyle={{ padding: "20px" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <UserOutlined
                      style={{ fontSize: "20px", color: "#595959" }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#262626",
                        }}
                      >
                        {user.name || "Unnamed User"}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "4px",
                        }}
                      >
                        <MailOutlined style={{ fontSize: "12px", color: "#8c8c8c" }} />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#8c8c8c",
                          }}
                        >
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#fff",
                      borderRadius: "6px",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#8c8c8c",
                        fontWeight: 500,
                        marginBottom: "8px",
                      }}
                    >
                      ACTIVE ALERTS
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#262626",
                      }}
                    >
                      {user.selectedDevices?.length || 0}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#8c8c8c",
                        marginTop: "4px",
                      }}
                    >
                      {user.selectedDevices?.length === 1
                        ? "device configured"
                        : "devices configured"}
                    </p>
                  </div>

                  <Button
                    type="primary"
                    icon={<BellOutlined />}
                    onClick={() => handleConfigureAlerts(user)}
                    block
                    style={{
                      backgroundColor: "#262626",
                      borderColor: "#262626",
                      height: "36px",
                      borderRadius: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Configure Alerts
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BellOutlined style={{ color: "#262626" }} />
            <span style={{ fontWeight: 600 }}>Configure Alert Subscriptions</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setSelectedModels([]);
        }}
        onOk={handleSaveConfig}
        okText="Save Configuration"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: "#262626", borderColor: "#262626" },
          loading: savingConfig,
        }}
        width={600}
      >
        {loadingConfig ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" tip="Loading configuration..." />
          </div>
        ) : selectedUser ? (
          <div style={{ padding: "20px 0" }}>
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
              }}
            >
              <p style={{ margin: 0, fontWeight: "bold" }}>
                User: {selectedUser.name || "User"}
              </p>
              <p style={{ margin: "5px 0 0 0", color: "#666" }}>
                Email: {selectedUser.email}
              </p>
            </div>

            <h4
              style={{
                marginBottom: "15px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Select models to receive email alerts:
            </h4>

            {loadingModels ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin tip="Loading models..." />
              </div>
            ) : availableModels.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#8c8c8c" }}>
                No models available
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  padding: "8px 0",
                }}
              >
                {availableModels.map((model) => (
                  <Checkbox
                    key={model.id}
                    checked={selectedModels.includes(model.id)}
                    onChange={() => handleModelToggle(model.id)}
                    style={{ fontSize: "14px" }}
                  >
                    {model.name}
                  </Checkbox>
                ))}
              </div>
            )}

            {selectedModels.length === 0 && !loadingModels && (
              <p
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#fff1f0",
                  border: "1px solid #ffccc7",
                  borderRadius: "6px",
                  color: "#cf1322",
                  fontSize: "13px",
                  margin: "16px 0 0 0",
                }}
              >
                ⚠️ No models selected. User will not receive any alerts.
              </p>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
