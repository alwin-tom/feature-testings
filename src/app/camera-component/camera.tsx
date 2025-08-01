"use client";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function CameraComponent() {

    const [startCam, setStartCam] = useState(false);
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

    useEffect(() => {
        alert(isMobile())
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => alert("Camera works"))
            .catch(err => alert("Camera error:" + err.message));
    });

    const isMobile = () => {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
        
        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }


    return (
        <>
            {/* {!startCam && <button onClick={() => setStartCam(true)}>Enable Camera</button>} */}
            {!startCam &&
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
            }
        </>
    );
}
