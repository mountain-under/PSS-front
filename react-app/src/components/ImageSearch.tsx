import React, { useState, useEffect } from 'react';
import { getProjectsAndClusters, getImages } from '../firebase/firebaseUtils';
import './ImageSearch.css';  // スタイルシートをインポート

const ImageSearch: React.FC = () => {
  const [projects, setProjects] = useState<string[]>([]);
  const [clusters, setClusters] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [displayedImages, setDisplayedImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const imagesPerPage = 10;
  const [modalImage, setModalImage] = useState<{ objectImage: string, cameraImage: string, baseName: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProjectsAndClusters();
      console.log('Projects and Clusters:', data);
      setProjects(Object.keys(data));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchClustersAndImages = async () => {
      if (selectedProject) {
        const data = await getProjectsAndClusters();
        console.log(`Clusters for project ${selectedProject}:`, data[selectedProject]);
        setClusters(data[selectedProject] || []);
        const allImages = await getImagesForProject(selectedProject, data[selectedProject] || []);
        setImages(allImages);
        setDisplayedImages(allImages.slice(0, imagesPerPage));
        setCurrentPage(1);
      } else {
        setClusters([]);
        setImages([]);
        setDisplayedImages([]);
        setCurrentPage(1);
      }
    };
    fetchClustersAndImages();
  }, [selectedProject]);

  useEffect(() => {
    if (selectedCluster) {
      const fetchFilteredImages = async () => {
        const filteredImages = await getImages(selectedProject, selectedCluster);
        setImages(filteredImages);
        setDisplayedImages(filteredImages.slice(0, imagesPerPage));
        setCurrentPage(1);
      };
      fetchFilteredImages();
    } else if (selectedProject) {
      const fetchAllImages = async () => {
        const data = await getProjectsAndClusters();
        const allImages = await getImagesForProject(selectedProject, data[selectedProject] || []);
        setImages(allImages);
        setDisplayedImages(allImages.slice(0, imagesPerPage));
        setCurrentPage(1);
      };
      fetchAllImages();
    } else {
      setImages([]);
      setDisplayedImages([]);
      setCurrentPage(1);
    }
  }, [selectedCluster]);

  const getImagesForProject = async (project: string, projectClusters: string[]) => {
    let allImages: string[] = [];
    for (const cluster of projectClusters) {
      const clusterImages = await getImages(project, cluster);
      allImages = allImages.concat(clusterImages);
    }
    return allImages;
  };

  const handlePageChange = (newPage: number) => {
    const startIndex = (newPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    setDisplayedImages(images.slice(startIndex, endIndex));
    setCurrentPage(newPage);
  };

  const handleImageClick = (objectImage: string) => {
    const fileName = objectImage.split('/').pop()!.split('?')[0];
    const baseName = fileName.replace(/^.*object_/, '').replace(/_x\d+_y\d+\.jpg$/, '.jpg');
    const cameraImage = `https://firebasestorage.googleapis.com/v0/b/pss-front.appspot.com/o/${selectedProject}%2Fcamera_imgs%2F${baseName}?alt=media`;
    setModalImage({ objectImage, cameraImage, baseName });
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  const extractFileName = (url: string) => {
    const fileName = url.split('/').pop()!.split('?')[0];
    return fileName.replace(/^.*object_/, 'object_');
  };

  return (
    <div className="container">
      <h1>Image Search</h1>
      <div className="select-container">
        <div className="select-box">
          <label>プロジェクト選択</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            <option value="">未選択</option>
            {projects.map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        <div className="select-box">
          <label>クラスタ選択</label>
          <select value={selectedCluster} onChange={(e) => setSelectedCluster(e.target.value)} disabled={!selectedProject}>
            <option value="">未選択</option>
            {clusters.map((cluster) => (
              <option key={cluster} value={cluster}>{cluster}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="images-container">
        {displayedImages.length > 0 ? (
          <div>
            <div className="image-grid">
              {displayedImages.map((url, index) => (
                <div key={index} className="image-container">
                  <img
                    src={url}
                    alt="filtered"
                    onClick={() => handleImageClick(url)}
                  />
                  <p>{extractFileName(url)}</p>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                前
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage * imagesPerPage >= images.length}>
                次
              </button>
            </div>
          </div>
        ) : (
          <p>画像がありません。</p>
        )}
      </div>
      {modalImage && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <img src={modalImage.objectImage} alt="Object" className="modal-image" />
            <p>{extractFileName(modalImage.objectImage)}</p>
            <img src={modalImage.cameraImage} alt="Camera" className="modal-image" />
            <p>{modalImage.baseName}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSearch;
