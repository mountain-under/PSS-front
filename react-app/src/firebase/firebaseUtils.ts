import { storage } from '../firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

export const getProjectsAndClusters = async () => {
  const projectsRef = ref(storage, '');
  const projects = await listAll(projectsRef);

  const projectClusters: { [key: string]: string[] } = {};
  for (const project of projects.prefixes) {
    console.log(`Project: ${project.name}`);
    const clustersRef = ref(storage, `${project.fullPath}/object_imags/`);
    try {
      const clusters = await listAll(clustersRef);
      if (clusters.prefixes.length === 0) {
        console.log(`No clusters found for project ${project.name}`);
      } else {
        projectClusters[project.name] = clusters.prefixes.map(cluster => {
          console.log(`Cluster: ${cluster.name}`);
          return cluster.name;
        });
      }
    } catch (error) {
      console.error(`Error listing clusters for project ${project.name}:`, error);
    }
  }
  return projectClusters;
};

export const getImages = async (project: string, cluster: string) => {
  const imagesRef = ref(storage, `${project}/object_imags/${cluster}/`);
  try {
    const images = await listAll(imagesRef);
    const imageUrls = await Promise.all(images.items.map(async itemRef => {
      const url = await getDownloadURL(itemRef);
      console.log(`Image URL: ${url}`);
      return url;
    }));
    return imageUrls;
  } catch (error) {
    console.error(`Error listing images for project ${project} and cluster ${cluster}:`, error);
    return [];
  }
};
