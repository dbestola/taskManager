/* eslint-disable react/prop-types */
import { useEffect, useRef, useCallback } from "react";
import { Camera } from "lucide-react";
import * as Sentry from "@sentry/react";

const PROFILE_IMAGE_TRANSFORMATION =
  "c_crop,g_custom/c_fill,w_400,h_400,q_auto,f_auto";

const formatProfileImageUrl = (secureUrl) => {
  try {
    const url = new URL(secureUrl);
    const uploadPath = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(uploadPath);

    if (uploadIndex === -1) {
      return secureUrl;
    }

    const pathBeforeAsset = url.pathname.slice(
      0,
      uploadIndex + uploadPath.length
    );
    const assetPath = url.pathname.slice(uploadIndex + uploadPath.length);

    if (!assetPath || assetPath.startsWith(PROFILE_IMAGE_TRANSFORMATION)) {
      return secureUrl;
    }

    url.pathname = `${pathBeforeAsset}${PROFILE_IMAGE_TRANSFORMATION}/${assetPath}`;
    return url.toString();
  } catch (error) {
    Sentry.captureException(error);
    return secureUrl;
  }
};

const CloudinaryUploadWidget = ({
  uploadConfig,
  onUploadSuccess,
  onUploadError,
  className = "",
}) => {
  const uploadWidgetRef = useRef(null);

  const initializeUploadWidget = useCallback(() => {
    if (
      !uploadConfig.cloudName ||
      !uploadConfig.uploadPreset ||
      !window.cloudinary
    ) {
      uploadWidgetRef.current = null;
      return null;
    }

    Sentry.addBreadcrumb({
      category: "cloudinary",
      message: "Initializing upload widget",
    });

    const widget = window.cloudinary.createUploadWidget(
      uploadConfig,
      (error, result) => {
        if (error) {
          Sentry.captureException(error);
          console.error("Upload error:", error);
          onUploadError("We couldn't upload your image. Please try again.");
          return;
        }

        if (result?.event === "success" && result.info?.secure_url) {
          onUploadSuccess(formatProfileImageUrl(result.info.secure_url));
        }
      }
    );
    uploadWidgetRef.current = widget;
    return widget;
  }, [onUploadError, onUploadSuccess, uploadConfig]);

  useEffect(() => {
    initializeUploadWidget();

    return () => {
      uploadWidgetRef.current?.destroy?.();
      uploadWidgetRef.current = null;
    };
  }, [initializeUploadWidget]);

  const handleUploadClick = () => {
    const widget = uploadWidgetRef.current || initializeUploadWidget();

    if (widget) {
      widget.open();
      return;
    }

    onUploadError(
      "Image upload is unavailable right now. Please try again soon."
    );
  };

  return (
    <button
      type="button"
      onClick={handleUploadClick}
      className={`flex items-center ${className}`}
      aria-label="Update profile picture"
    >
      <Camera className="h-4 w-4" />
    </button>
  );
};

export default CloudinaryUploadWidget;
