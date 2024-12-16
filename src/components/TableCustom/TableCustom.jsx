import React, { useState } from "react";
import { FaDownload, FaSort } from "react-icons/fa";

const TableCustom = ({ data, handleDownload }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full overflow-x-auto shadow-lg rounded-lg">
      <table className="min-w-full bg-white" role="table">
        <thead>
          <tr className="bg-primary-5 border-b border-gray-200">
            {["Lệnh sản xuất", "Loại men", "Khách hàng", "Kích thước dây", "Bắt đầu", "kết thúc", "Báo cáo"].map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-950"
                onClick={() => handleSort(header.toLowerCase().replace(" ", ""))}
              >
                <div className="flex items-center space-x-1">
                  <span>{header}</span>
                  <FaSort className="text-gray-400" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr
              key={`${index}`}
              className={`$ {
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-gray-100 transition-colors duration-200`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.workOrder}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.enamel}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.customer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.size}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(row.startAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(row.endAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button
                  onClick={() => handleDownload(row)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-5 hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  // aria-label={`Download work order ${row}`}
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableCustom;
