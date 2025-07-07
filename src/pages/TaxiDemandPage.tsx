import React from "react";
import NYCTaxiDashboard from "@/components/demand/NYCTaxiDashboard";

const TaxiDemandPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NYCTaxiDashboard />
    </div>
  );
};

export default TaxiDemandPage;
