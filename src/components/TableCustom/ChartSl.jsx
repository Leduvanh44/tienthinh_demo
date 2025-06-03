import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line
} from "recharts";

// Custom shape bar bo 2 góc trên (rx = ry = radius)
const RoundedTopBar = (props) => {
  const { x, y, width, height, fill, stroke, strokeWidth } = props;
  const radius = 8; // bán kính bo góc

  // height có thể âm nếu giá trị âm, nên xử lý cho đúng
  const h = Math.abs(height);
  const yRect = height < 0 ? y - h : y;

  // Vẽ path hình chữ nhật bo 2 góc trên
  // path vẽ từ trái trên theo chiều kim đồng hồ:
  // M start ở (x, y+radius)
  // bo góc trên trái, vẽ đường thẳng trên, bo góc trên phải,
  // vẽ đường thẳng xuống, đường đáy, rồi lên đường bên trái
  const path = `
    M${x},${yRect + radius}
    A${radius},${radius} 0 0 1 ${x + radius},${yRect}
    L${x + width - radius},${yRect}
    A${radius},${radius} 0 0 1 ${x + width},${yRect + radius}
    L${x + width},${yRect + h}
    L${x},${yRect + h}
    Z
  `;

  return (
    <path
      d={path}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

export default function ChartSl({ dataHs }) {
  return (
    <ResponsiveContainer width="40%" height={310}>
      <ComposedChart data={dataHs}>
        <CartesianGrid stroke="#f5f5f5" />

        <XAxis dataKey="name" />

        {/* YAxis trái */}
        <YAxis
          yAxisId="left"
          orientation="left"
          label={{ value: "Khối lượng (kg)", angle: -90, position: "insideLeft" }}
        />

        <Tooltip />
        <Legend />

        <Bar
          yAxisId="left"
          dataKey="SL 24h"
          stackId="1"
          fill="#9BBBFE"
          barSize={50}
        />
        <Bar
          yAxisId="left"
          dataKey="SL thực tế"
          stackId="1"
          fill="#FE9B9B"
          barSize={50}
        />
        <Bar
          yAxisId="left"
          dataKey="SL thất thoát"
          stackId="1"
          fill="#B2AFB2"
          barSize={50}
          shape={<RoundedTopBar />}
        />

      </ComposedChart>
    </ResponsiveContainer>
  );
}
