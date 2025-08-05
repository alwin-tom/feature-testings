import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import "./capture-image.scss";
import { getUserDetails, isUserLoggedIn } from "../../services/token-service";
import { useNavigate } from "react-router-dom";
import useAxiosInterceptors from '../../config/axios-config';
import { toast } from "react-toastify";
const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";



const WebcamWithCapture = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState({
    webcam: false,
    location: false,
  });
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState('')
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  // Webcam constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: FACING_MODE_USER
  };

  // Capture image
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImages([...capturedImages, imageSrc]);
    }
  };

  // Request location permission
  useEffect(() => {
    if (isUserLoggedIn()) {
      checkWebcamPermissionGranted();
      checkLocationPermissionGranted();
      setUserDetails(getUserDetails());
    } else {
      navigate("/login")
    }

  }, []);

  const checkWebcamPermissionGranted = () => {
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
      return toMatch.some((toMatchItem) => navigator.userAgent.match(toMatchItem));
    };
  
    if (isMobile()) {
      // On mobile, skip permissions.query and directly try getUserMedia
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          setPermissionsGranted((prev) => ({ ...prev, webcam: true }));
          stream.getTracks().forEach(track => track.stop()); // Stop the stream after checking
        })
        .catch((err) => {
          console.error("Mobile camera access error:", err);
          setPermissionsGranted((prev) => ({ ...prev, webcam: false }));
        });
    } else {
      // On desktop, try permissions.query first
      navigator.permissions.query({ name: 'camera' })
        .then((permissionStatus) => {
          console.log("Camera permission status:", permissionStatus.state);
          if (permissionStatus.state === 'granted') {
            setPermissionsGranted((prev) => ({ ...prev, webcam: true }));
          } else {
            // Try getUserMedia as fallback
            navigator.mediaDevices.getUserMedia({ video: true })
              .then((stream) => {
                setPermissionsGranted((prev) => ({ ...prev, webcam: true }));
                stream.getTracks().forEach(track => track.stop());
              })
              .catch((err) => {
                console.error("Desktop camera access error:", err);
                setPermissionsGranted((prev) => ({ ...prev, webcam: false }));
              });
          }
  
          permissionStatus.onchange = () => {
            console.log("Camera permission changed to:", permissionStatus.state);
            setPermissionsGranted((prev) => ({
              ...prev,
              webcam: permissionStatus.state === 'granted'
            }));
          };
        })
        .catch((err) => {
          console.warn("permissions.query not supported or failed:", err);
          // Fallback to getUserMedia
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
              setPermissionsGranted((prev) => ({ ...prev, webcam: true }));
              stream.getTracks().forEach(track => track.stop());
            })
            .catch((err) => {
              console.error("Fallback camera access error:", err);
              setPermissionsGranted((prev) => ({ ...prev, webcam: false }));
            });
        });
    }
  };
  

  const checkLocationPermissionGranted = () => {
    navigator.geolocation
      .getCurrentPosition(
        (data) => {
          setPermissionsGranted((prev) => ({ ...prev, location: true }))
          setLocation((prev) => ({
            latitude: data.coords.latitude,
            longitude: data.coords.longitude
          }))
        },
        () => setPermissionsGranted((prev) => ({ ...prev, location: false }))
      );
  }

  const deleteImage = (index) => {
    var filteredImages = capturedImages.filter((e, i) => {
      return index != i;
    });
    setCapturedImages(filteredImages);
  }

  const openImageInNewTab = (imageBase64) => {
    // window.open(imageBase64, "_blank");
    let pdfWindow = window.open("")
    pdfWindow.document.write("<iframe width='100%' height='100%' src='" + imageBase64 + "'></iframe>")
  }

  const refreshPage = () => {
    checkLocationPermissionGranted();
    checkWebcamPermissionGranted();
  }

  const createRequestPayload = () => {
    return {
      "latitude": location.latitude,
      "longitude": location.longitude,
      "images": capturedImages
    };
  }

  const submitImages = () => {
    navigator.geolocation
      .getCurrentPosition(
        (data) => {
          console.log(data.coords.latitude);
          console.log(data.coords.latitude);
          console.log(new Date(data.timestamp));
          setLoading(true);
          useAxiosInterceptors.post(`data/v1`, createRequestPayload())
            .then(res => {
              if (res.data.status == 'SUCCESS') {
                toast.success("Data captured successfully", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: 0,
                  type: "success"
                });
                setCapturedImages([]);
                navigate('/confirmation', {
                  state: {
                    status: res.data.status,
                    submissionId: res.data.uploadId
                  }
                })
              } else {
                toast.error("Invalid credentials", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: 0,
                  type: "warning"
                });
                // navigate("/certificates");
              }
            })
            .catch(ex => {
              console.log(ex)
            })
            .finally(() => {
              setLoading(false);
            });

        });
  }
  const handleClick = () => {
    setFacingMode(
      prevState =>
        prevState === FACING_MODE_USER
          ? FACING_MODE_ENVIRONMENT
          : FACING_MODE_USER
    );
  };
  
  return (
    <>
      {loading ?
        <>
          <div className="overlay">
            <div className="overlay__inner">
              <div className="overlay__content">
                <span className="spinner"></span>
              </div>
            </div>
          </div>
        </>
        :
        <div className="container">
          <div className="row">
            {permissionsGranted.webcam && permissionsGranted.location ? (
              <div className="col-lg-12 mt-4">
                <div className="row">
                  <div className="col-lg-6 text-center">
                    <div style={{ width: "100%" }}>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        height={600}
                        width={600}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "2%",
                          objectFit: "cover",
                        }}
                      />
                      <button onClick={handleClick}
                      className="mt-2 btn btn-outline-primary btn-sm">
                      Switch Camera
                    </button>
                    </div>

                    <button onClick={capture}
                      disabled={capturedImages.length >= 3}
                      className="mt-2 btn btn-lg btn-outline-primary btn-sm">
                      Capture Image
                    </button>
                  </div>
                  <div className="col-lg-6 col-12 captured-images">
                    <div className="">
                      <div className="row">
                        <div className="col-lg-4">
                          <div className="rounded shadow text-data p-3 text-center">
                            <p className="text-muted text-heading">Latitude</p>
                            <p>{location.latitude}</p>
                          </div>

                        </div>
                        <div className="col-lg-4">
                          <div className="rounded shadow text-data p-3 text-center">
                            <p className="text-muted text-heading">Longitude</p>
                            <p>{location.longitude}</p>
                          </div>

                        </div>
                        <div className="col-lg-4">
                          <div className="rounded shadow text-data p-3 text-center">
                            <p className="text-muted text-heading">PF Number</p>
                            <p className="">{userDetails.pfNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      {capturedImages.length > 0 && (
                        capturedImages.map((img, index) => (
                          <div className="col-lg-4 mt-5 col-4 img-container-custom">
                            <img
                              key={index}
                              src={img}
                              onClick={() => openImageInNewTab(img)}
                              alt={`Capture ${index + 1}`}
                              className="rounded shadow image-cap captured-image"
                              style={{ width: "100%" }}
                            />
                            <img class="close-btn"
                              onClick={() => deleteImage(index)}
                              src="/images/icons/close.png" />
                          </div>
                        ))
                      )}
                      {capturedImages.length > 0 && (
                        <div className="col-lg-12 text-center mt-4">
                          <button onClick={submitImages} className="btn btn-primary">Submit</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            ) : (
              <div className="col-lg-12 text-center mt-5">
                <p>Permissions not enabled. Please enable location and camera permissions to continue.</p>
                <button onClick={refreshPage} className="btn btn-warning">I have enabled the permissions. Refresh now</button>
              </div>
            )}
          </div>
        </div>
      }
    </>

  );
};

export default WebcamWithCapture;
