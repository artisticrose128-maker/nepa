// utils/exportUtil.js
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

exports.exportExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Analytics Report");

  sheet.columns = [
    { header: "Amount", key: "amount" },
    { header: "Date", key: "createdAt" },
  ];

  sheet.addRows(data);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=analytics.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};

exports.exportPDF = (data, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=analytics.pdf"
  );

  doc.pipe(res);

  doc.fontSize(18).text("Analytics Report", { align: "center" });
  doc.moveDown();

  data.forEach((d) => {
    doc.text(`Amount: ${d.amount} | Date: ${d.createdAt}`);
  });

  doc.end();
};