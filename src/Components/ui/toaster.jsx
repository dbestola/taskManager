import { useToast } from "../../hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const iconByVariant = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

const iconClassByVariant = {
  default: "text-muted-foreground",
  info: "text-sky-600 dark:text-sky-300",
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  destructive: "text-red-600 dark:text-red-300",
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={3500}>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant = "default",
        ...props
      }) {
        const Icon = iconByVariant[variant] || Info;

        return (
          <Toast key={id} variant={variant} {...props}>
            <Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                iconClassByVariant[variant] || iconClassByVariant.default
              }`}
            />
            <div className="grid flex-1 gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
