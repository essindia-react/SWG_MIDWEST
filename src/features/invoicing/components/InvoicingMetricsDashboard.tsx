import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatInvoiceCurrency,
  getInvoiceStatusPieData,
  getMonthlyInvoiceBarData,
  getPaymentMethodsBarData,
  getPaymentsDonutData,
} from "../../../lib/invoiceHelpers";
import type { Invoice } from "../../../types/invoice";
import type { Project } from "../../../types/project";
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #E2E8F0",
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, mb: 0.25 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      {!subtitle && <Box sx={{ mb: 2 }} />}
      {children}
    </Box>
  );
}

interface InvoicingMetricsDashboardProps {
  projects: Project[];
  invoices: Invoice[];
}

export function InvoicingMetricsDashboard({ invoices }: InvoicingMetricsDashboardProps) {
  const paymentsData = getPaymentsDonutData(invoices);
  const statusData = getInvoiceStatusPieData(invoices);
  const methodsData = getPaymentMethodsBarData(invoices);
  const monthlyData = getMonthlyInvoiceBarData(invoices);

  const paymentsTotal = paymentsData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, mb: 0.5 }}>
        Invoicing Overview
      </Typography>
      <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 2.5 }}>
        Payment collection, status breakdown, and billing trends
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <ChartCard title="Payments" subtitle="Collected vs outstanding">
            {paymentsData.length === 0 ? (
              <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", py: 4, textAlign: "center" }}>
                No payment data yet
              </Typography>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={paymentsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {paymentsData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => formatInvoiceCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {paymentsData.map((slice) => (
                    <Box
                      key={slice.name}
                      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: slice.color,
                          }}
                        />
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {slice.name}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {paymentsTotal > 0
                          ? `${Math.round((slice.value / paymentsTotal) * 100)}%`
                          : "0%"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <ChartCard title="Invoice Status" subtitle="By current status">
            {statusData.length === 0 ? (
              <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", py: 4, textAlign: "center" }}>
                No invoices yet
              </Typography>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {statusData.map((slice) => (
                    <Box
                      key={slice.name}
                      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: slice.color,
                          }}
                        />
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {slice.name}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {slice.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <ChartCard title="Payment Methods" subtitle="Accepted on invoices">
            {methodsData.length === 0 ? (
              <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", py: 4, textAlign: "center" }}>
                No methods recorded
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={methodsData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Invoices" radius={[4, 4, 0, 0]}>
                    {methodsData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <ChartCard title="Monthly Invoices" subtitle="Count & amount (last 6 months)">
            {monthlyData.length === 0 ? (
              <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", py: 4, textAlign: "center" }}>
                No invoices yet
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) =>
                      name === "Amount" ? formatInvoiceCurrency(value) : value
                    }
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill="#2E7D32"
                    name="Count"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="amount"
                    fill="#A5D6A7"
                    name="Amount"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
