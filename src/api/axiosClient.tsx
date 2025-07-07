import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8012/vdi_mobifone',
  // headers, timeout, auth... có thể thêm ở đây
});

export default axiosClient;
