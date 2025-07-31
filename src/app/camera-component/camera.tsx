"use client";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

export default function CameraComponent() {

    const webcamRef = useRef(null);
    const [permissionsGranted, setPermissionsGranted] = useState({
        webcam: false,
        location: false,
    });

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user",
        minScreenshotHeight: 720,
        minScreenshotWidth: 1280
    };


    return (
        <>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                height={600}
                width={1280}
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "2%",
                    objectFit: "cover",
                }}
            />
        </>
    );
}