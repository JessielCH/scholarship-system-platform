import React from "react";
import { Check, Clock } from "lucide-react";
import clsx from "clsx";

const STEPS = [
  { id: "SELECTED", label: "Asignada" },
  { id: "WAITING", label: "Subir Documentos" },
  { id: "VALIDATED", label: "Validación" },
  { id: "ACADEMIC_OK", label: "Revisión Académica" },
  { id: "APPROVED", label: "Aprobada" },
  { id: "DISBURSED", label: "Desembolsado" },
];

export const Timeline = ({ currentStatus }: { currentStatus: string }) => {
  const getCurrentStepIndex = () => {
    if (currentStatus === "SIGNED") return 2;
    if (currentStatus === "CHANGES_REQUESTED") return 1;
    if (currentStatus === "REJECTED") return 2; // For visual rejection
    if (currentStatus === "AI_OK" || currentStatus === "VALIDATING_DOC" || currentStatus === "VALIDATED") return 2;
    if (currentStatus === "ACADEMIC_OK") return 3;
    if (currentStatus === "APPROVED") return 4;
    if (currentStatus === "DISBURSED" || currentStatus === "COMPLETED") return 5;
    
    const index = STEPS.findIndex((s) => s.id === currentStatus);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-8 px-4 overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-8 px-4">
        Progreso de la Solicitud
      </h3>
      <div className="flex items-center justify-between min-w-[700px] relative px-8 pb-6">
        {/* Background Line */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full" />

        {/* Active Line */}
        <div
          className="absolute top-1/2 left-8 h-1 bg-uce-blue -translate-y-1/2 -z-10 rounded-full transition-all duration-500 ease-out"
          style={{ width: `calc(${(currentIndex / (STEPS.length - 1)) * 100}% - 4rem)` }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative group"
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                  isCompleted
                    ? "bg-uce-blue border-uce-blue text-white shadow-md"
                    : "bg-white border-gray-300 text-gray-400",
                  isCurrent && "ring-4 ring-blue-100 scale-110",
                  currentStatus === "REJECTED" && isCurrent && "bg-uce-red border-uce-red"
                )}
              >
                {isCompleted ? (
                  isCurrent ? (
                    <Clock size={18} className="animate-pulse" />
                  ) : (
                    <Check size={18} />
                  )
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>

              <span
                className={clsx(
                  "absolute top-12 text-xs font-semibold whitespace-nowrap transition-colors duration-300",
                  isCompleted ? "text-uce-blue" : "text-gray-400",
                  currentStatus === "REJECTED" && isCurrent && "text-uce-red"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
