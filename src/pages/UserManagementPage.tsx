import { useEffect, useState } from "react";
import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Spin, 
  Table,
  Popconfirm,
  Tag 
} from "antd";
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MailOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers, saveUserProfileByAdmin, deleteUser } from "../api/usersApi";

interface UserData {
  uid?: string;
  id?: number;
  email: string;
  name?: string;
  role?: string;
  selectedDevices?: string[];
}

export const UserManagementPage = () => {
  const auth = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = (auth as any).token;
      if (!token) throw new Error('Not authenticated');
      const usersList = await getAllUsers(token);
      const fetchedUsers: UserData[] = usersList.map((u) => ({
        uid: String(u.id),
        id: u.id,
        email: u.email,
        name: u.displayName ?? u.name ?? '',
        role: u.role ?? 'user',
        selectedDevices: u.selectedDevices ?? [],
      }));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users from API");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      name: user.name,
      role: user.role || "user",
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = (auth as any).token;
      if (!token) throw new Error('Not authenticated');
      await deleteUser(token, Number(userId));
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user");
    }
  };

  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const token = (auth as any).token;
      if (!token) throw new Error('Not authenticated');

      if (editingUser && editingUser.id) {
        // Update existing user
        await saveUserProfileByAdmin(token, {
          id: editingUser.id,
          email: values.email,
          name: values.name,
          role: values.role,
        });
        message.success("User updated successfully");
      } else {
        // Add new user
        await saveUserProfileByAdmin(token, {
          email: values.email,
          name: values.name,
          role: values.role,
          selectedDevices: [],
          password: values.password ?? '',
        });
        message.success("User added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => text || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: "#666" }} />
          {text}
        </span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {(role || "user").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Selected Devices",
      dataIndex: "selectedDevices",
      key: "selectedDevices",
      render: (devices: string[]) => (
        <span>{devices?.length || 0} devices</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UserData) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete user"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.uid!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

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
          title="User Management"
          description="Manage system users and control access permissions."
          icon={<TeamOutlined />}
        />

        <div style={{ padding: "24px 40px" }}>
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddUser}
              style={{
                backgroundColor: "#262626",
                borderColor: "#262626",
                height: "40px",
                borderRadius: "6px",
                fontWeight: 500,
              }}
            >
              Add User
            </Button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={users}
              columns={columns}
              rowKey="uid"
              pagination={{ pageSize: 10 }}
              style={{ 
                backgroundColor: "#fff",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
              }}
            />
          )}
        </div>
      </div>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserOutlined style={{ color: "#2C2803" }} />
            <span>{editingUser ? "Edit User" : "Add New User"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSaveUser}
        okText={editingUser ? "Update" : "Add"}
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: "#2C2803", borderColor: "#2C2803" },
          loading: saving,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please input a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
