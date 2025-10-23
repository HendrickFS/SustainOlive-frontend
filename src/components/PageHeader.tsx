import { Typography } from "antd";
import type { ReactNode } from "react";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export const PageHeader = ({ title, description, icon }: PageHeaderProps) => {
  return (
    <div
      style={{
        padding: "40px 40px 32px 40px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        {icon && (
          <div
            style={{
              fontSize: "32px",
              color: "#262626",
              display: "flex",
              alignItems: "center",
              marginTop: "4px",
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <Title
            level={2}
            style={{
              margin: 0,
              color: "#262626",
              fontWeight: 600,
              fontSize: "32px",
              lineHeight: "1.2",
            }}
          >
            {title}
          </Title>
          <Text
            style={{
              color: "#8c8c8c",
              fontSize: "14px",
              display: "block",
              marginTop: "8px",
              lineHeight: "1.5",
            }}
          >
            {description}
          </Text>
        </div>
      </div>
    </div>
  );
};
