import { useEffect } from 'react';
import 'mind-ar/dist/mindar-image-three.prod.js';

/**
 * MindAR POC Component
 * Reference: https://hiukim.github.io/mind-ar-js-doc/
 */
export const MindARPOC = () => {
  useEffect(() => {
    // Basic MindAR Image Tracking initialization logic
    const mindarThree = new (window as any).MindAR.Image3.MindARThree({
      container: document.querySelector("#container"),
      imageTargetSrc: "/assets/targets.mind",
    });

    const { renderer, scene, camera } = mindarThree;

    // TODO: Add 3D models here
    
    mindarThree.start().then(() => {
      console.log("MindAR started");
    });

    return () => {
      // Clean up logic
    };
  }, []);

  return <div id="container" style={{ width: '100vw', height: '100vh' }} />;
};
