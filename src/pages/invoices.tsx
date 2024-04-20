import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchReceipts, getAllOfficeDetails } from "../utils/helpers";
import { officeDetailsType, receiptsType, currentEmpolyeeType } from "../types";
import { AddIcon } from "../components/Icons";
import PrintSelectedReceipts from "./PrintSelectedReceipts";

const westernToArabic = (number: number): string => {
  const arabicNumbers: string[] = [
    "٠",
    "١",
    "٢",
    "٣",
    "٤",
    "٥",
    "٦",
    "٧",
    "٨",
    "٩",
  ];
  return number
    .toString()
    .replace(/\d/g, (digit) => arabicNumbers[parseInt(digit)]);
};

export default function Invoices(): JSX.Element {
  const { customerId } = useParams<{ customerId: string }>();
  const [receipts, setReceipts] = useState<receiptsType[]>([]);
  const [selectedReceipts, setSelectedReceipts] = useState<receiptsType[]>([]);
  const [allOfficeDetails, setAllOfficeDetails] = useState<officeDetailsType[]>(
    []
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const currentEmpolyee: currentEmpolyeeType = {
    name:
      JSON.parse(localStorage.getItem("employee_data") || "").full_name ?? null,
    id:
      Number(JSON.parse(localStorage.getItem("employee_data") || "").id) ??
      null,
    role:
      JSON.parse(localStorage.getItem("employee_data") || "").role ??
      "employee",
  };

  const getAllReceipts = async (): Promise<void> => {
    const receipts: receiptsType[] | any = await fetchReceipts({
      customerId: Number(customerId),
    });
    setReceipts(receipts);
    setSelectedReceipts([]);
  };

  useEffect(() => {
    const getOfficeDetails = async (): Promise<void> => {
      const officeDetails: officeDetailsType[] = await getAllOfficeDetails();
      setAllOfficeDetails(officeDetails);
    };
    const allReceipts = async (): Promise<void> => await getAllReceipts();
    getOfficeDetails();
    allReceipts();
  }, []);

  const calculateTotalRevenue = () => {
    // Filter receipts based on search term, employee id, and role
    const filteredReceipts = filterReceipts(
      receipts.filter(
        (receipt) =>
          receipt.employee_id === currentEmpolyee.id ||
          currentEmpolyee.role === "admin"
      )
    );

    // Calculate total revenue using reduce
    const total = filteredReceipts.reduce((acc, receipt) => {
      // Convert service_paid_amount to float and add to accumulator
      return acc + parseFloat(String(receipt.service_paid_amount));
    }, 0);

    setTotalRevenue(total);
  };

  useEffect(() => {
    // Calculate total revenue whenever receipts, allOfficeDetails, searchTerm, or current employee id change
    calculateTotalRevenue();
  }, [
    receipts,
    allOfficeDetails,
    searchTerm,
    currentEmpolyee.id,
    currentEmpolyee.role,
  ]);

  const handleSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const isChecked: boolean = event.target.checked;
    setSelectAll(isChecked);

    const updatedReceipts: receiptsType[] = receipts.map((receipt) => {
      if (
        (currentEmpolyee.role === "admin" ||
          receipt.employee_id === currentEmpolyee.id) &&
        (searchTerm === "" ||
          arabicDate(receipt.created_at).includes(searchTerm) ||
          receipt.client_name.includes(searchTerm))
      ) {
        return { ...receipt, selected: isChecked };
      }
      return receipt;
    });

    setReceipts(updatedReceipts);

    setSelectedReceipts(updatedReceipts.filter((receipt) => receipt.selected));
  };

  const handleCheckboxChange = (receiptId: number): void => {
    const updatedReceipts: receiptsType[] = receipts.map((receipt) => {
      if (receipt.receipt_id === receiptId) {
        return { ...receipt, selected: !receipt.selected };
      }
      return receipt;
    });
    setReceipts(updatedReceipts);

    const selected: receiptsType[] = updatedReceipts.filter(
      (receipt) => receipt.selected
    );
    setSelectedReceipts(selected);
  };

  const filterReceipts = (receipts: receiptsType[]): receiptsType[] => {
    return receipts.filter((receipt) => {
      const matchDate: boolean = arabicDate(receipt.created_at).includes(
        searchTerm
      );
      const matchCustomer: boolean = receipt.client_name.includes(searchTerm);
      return matchDate || matchCustomer;
    });
  };

  const arabicDate = (dateString: string): string => {
    const date: Date = new Date(dateString);
    const year: string = westernToArabic(date.getFullYear());
    const month: string = westernToArabic(date.getMonth() + 1);
    const day: string = westernToArabic(date.getDate());
    return `${year}/${month}/${day}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const input = e.target.value.toString(); // Convert input to string
    // Check if the input is not empty and not a number
    if (input !== "" && isNaN(Number(input))) {
      setSearchTerm(input);
    } else {
      // If input is numeric, convert it to Arabic
      setSearchTerm(input !== "" ? westernToArabic(Number(input)) : ""); // Keep previous value if input is empty
    }
  };

  return (
    <section>
      <div>
        <PrintSelectedReceipts
          selectedReceipts={selectedReceipts}
          officeDetails={allOfficeDetails[0]}
        />
      </div>

      <div dir="rtl" className="invoices-container">
        <h2>بيانات الفواتير</h2>
        <div>
          <input
            type="text"
            placeholder="ابحث حسب تاريخ الفاتورة أو اسم العميل"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <table dir="rtl">
          <thead>
            <tr>
              <th style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input
                  id="selectAll"
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAll" style={{ cursor: "pointer" }}>
                  تحديد الكل
                </label>
              </th>
              <th>تسلسل</th>
              <th>تاريخ الفتوره</th>
              <th>اسم العميل</th>
              <th>الخدمة</th>
              <th>السعر</th>
              <th>الموظف المسئول</th>
            </tr>
          </thead>
          <tbody>
            {!receipts || receipts.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  لا يوجد فواتير
                  <br />
                  <Link
                    to="/services"
                    className="back-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    <AddIcon />
                    إضافة خدمة جديدة
                  </Link>
                </td>
              </tr>
            ) : (
              filterReceipts(receipts).map((receipt: receiptsType) => {
                if (
                  currentEmpolyee.role === "admin" ||
                  receipt.employee_id === currentEmpolyee.id
                ) {
                  return (
                    <tr key={receipt.receipt_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={receipt.selected || false}
                          onChange={() =>
                            handleCheckboxChange(receipt.receipt_id)
                          }
                          style={{
                            cursor: "pointer",
                            height: "20px",
                            width: "100%",
                            marginInline: "auto",
                          }}
                        />
                      </td>
                      <td>{receipt.receipt_id}</td>
                      <td>{arabicDate(receipt.created_at)}</td>
                      <td>{receipt.client_name}</td>
                      <td>{receipt.service_name}</td>
                      <td>{receipt.service_paid_amount}</td>
                      <td>{receipt.full_name}</td>
                    </tr>
                  );
                } else {
                  return null;
                }
              })
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{ textAlign: "end" }}>
                الإجمالي
              </td>
              <td>{totalRevenue}</td>
              <td>&nbsp;</td>
            </tr>
          </tfoot>
        </table>
        <Link to="/dashboard" className="back-btn">
          العودة
        </Link>
      </div>
    </section>
  );
}
