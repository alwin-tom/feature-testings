"use client";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function CameraComponent() {

    const [startCam, setStartCam] = useState(true);
    const [camNumber, setCamNumber] = useState(0);
    const [currentCam, setCurrentCam] = useState("front");
    const [availableCams, setAvailableCams] = useState([]);
    const webcamRef = useRef(null);
    const [permissionsGranted, setPermissionsGranted] = useState({
        webcam: false,
        location: false,
    });

    let videoConstraints: any = {
        width: 1280,
        height: 720,
        facingMode: { exact: 'environment' },
        //facingMode: "user"
    };

    useEffect(() => {
        // alert(isMobile())
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                // alert("Camera works");
            })
            .catch(err => alert("Camera error:" + err.message));

        navigator.mediaDevices.enumerateDevices().then(gotDevices)
            .then((availableVideoInputs: any) => {
                setAvailableCams(availableVideoInputs)
                setCamNumber(availableVideoInputs.length)
            })
            .catch((err) => {
                alert("Error");
                console.log(err);
            })

    });

    const gotDevices = (mediaDevices: any) =>
        new Promise((resolve, reject) => {
            const availableVideoInputs: any = []
            mediaDevices.forEach((mediaDevice: any) => {
                if (mediaDevice.kind === 'videoinput') {
                    availableVideoInputs.push({
                        deviceId: mediaDevice.deviceId,
                        label: mediaDevice.label
                    })
                }
            })

            if (availableVideoInputs.length > 0) {
                resolve(availableVideoInputs)
            } else {
                reject(new Error('ERR::NO_MEDIA_TO_STREAM'))
            }
        });

    const toggleCamera = () => {
        if (currentCam === "back") {
            videoConstraints = {
                width: 1280,
                height: 720,
                facingMode: "user",
                minScreenshotHeight: 720,
                minScreenshotWidth: 1280
            };
            setCurrentCam("front");
        } else {
            setCurrentCam("back");
            videoConstraints = {
                width: 1280,
                height: 720,
                facingMode: { exact: 'environment' },
                minScreenshotHeight: 720,
                minScreenshotWidth: 1280
            };
        }
    }    
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

    const startCamera = () => {
        setStartCam(true);
    }


    return (
        <>
            {JSON.stringify(availableCams)}
            {camNumber && camNumber > 1 && <button onClick={() => toggleCamera()}>Toggle</button>}
       
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
