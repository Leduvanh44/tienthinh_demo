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
  Line,
  LabelList
} from "recharts";

const RoundedTopBar = (props) => {
  const { x, y, width, height, fill, stroke, strokeWidth } = props;
  const radius = 8;
  const h = Math.abs(height);
  const yRect = height < 0 ? y - h : y;

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
const renderCustomBarLabel = (barKey, data) => (props) => {
  const { x, y, width, height, index } = props;
  const labelX = x + width / 2;
  const labelY = y + height / 2;
  const entry = data[index];

  const stackKeys = ['TG máy HĐ', 'TG máy HĐ thực tế', 'TG máy không HĐ'];

  let belowValue = 0;
  for (let i = 0; i < stackKeys.length; i++) {
    if (stackKeys[i] === barKey) break;
    belowValue += entry[stackKeys[i]] || 0;
  }

  const total = stackKeys.reduce((sum, key) => sum + (entry[key] || 0), 0);
  const barValue = entry[barKey] || 0;
  const chartHeight = 200; 
  const yPosition = chartHeight * (1 - (belowValue + barValue / 2) / total);

  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor="middle"
      fill="#000"
      fontSize={12}
      dominantBaseline="middle"
    >
      {barValue.toFixed(1)}h
    </text>
  );
};

export default function ChartHs({ dataHs }) {
  return (
    <ResponsiveContainer width="59%" height={310}>
      <ComposedChart data={dataHs}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="name" />

        <YAxis
          yAxisId="left"
          orientation="left"
          label={{ value: "Thời gian (giờ)", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Hiệu suất (%)", angle: -90, position: "insideRight" }}
        />

        <Tooltip />
        <Legend />

<Bar
  yAxisId="left"
  dataKey="TG máy HĐ"
  stackId="1"
  fill="#9BBBFE"
  barSize={50}
>
  <LabelList content={renderCustomBarLabel('TG máy HĐ', dataHs)} />
</Bar>

<Bar
  yAxisId="left"
  dataKey="TG máy HĐ thực tế"
  stackId="1"
  fill="#FE9B9B"
  barSize={50}
>
  <LabelList content={renderCustomBarLabel('TG máy HĐ thực tế', dataHs)} />
</Bar>

<Bar
  yAxisId="left"
  dataKey="TG máy không HĐ"
  stackId="1"
  fill="#B2AFB2"
  barSize={50}
  shape={<RoundedTopBar />}
>
  <LabelList content={renderCustomBarLabel('TG máy không HĐ', dataHs)} />
</Bar>


        <Line
          yAxisId="right"
          type="monotone"
          dataKey="Hiệu suất"
          stroke="#171389"
          strokeWidth={3}
          dot={{ r: 4, stroke: "#171389", strokeWidth: 2 }}
          label={({ x, y, value }) => (
            <text
              x={x}
              y={10}  // đẩy label lên cao hơn (thay vì -10)
              textAnchor="middle"
              fill="#171389"
              fontSize={14}
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {value}%
            </text>
          )}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
