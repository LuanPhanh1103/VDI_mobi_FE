import DesktopDetails from 'src/components/desktopDetails/DesktopDetails';
import { useEffect, useMemo, useState } from 'react';
import { useUser } from 'src/hooks/UserContext';
import { Desktop } from '../../types/user/User';
import { useParams } from 'react-router-dom';
import axiosClient from 'src/api/axiosClient';
import Spinner from '../spinner/Spinner';
import Error from '../auth/error/Error';

export interface DesktopDetailsType {
  desktop: Desktop;
  ipList: string[];
  desNameList: string[];
}

const DeskDetails = () => {
  const { token, userDetails, hasPermission } = useUser();
  const { desktopName } = useParams();
  const [desktops, setDesktops] = useState<Desktop[]>([]);
  const [currenDesktop, setCurrentDesktop] = useState<Desktop | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingDesktops, setLoadingDesktops] = useState(false);

  // Reset states when desktopName changes
  useEffect(() => {
    setCurrentDesktop(null);
    setLoading(true);
    setLoadingDesktops(true);
  }, [desktopName]);

  //get all desktop
  useEffect(() => {
    const fetchDesktops = async () => {
      if (!hasPermission('get_all_VDI')) return;

      try {
        setLoadingDesktops(true);
        const res = await axiosClient.get('/virtualDesktops', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDesktops(res.data.result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách desktop:', error);
      } finally {
        setLoading(false);
        setLoadingDesktops(false);
      }
    };

    fetchDesktops();
  }, [token, userDetails?.id, desktopName, hasPermission]);

  const { ipList, desNameList } = useMemo(() => {
    const ipList: string[] = [];
    const desNameList: string[] = [];

    desktops
      .filter((des) => des.name !== desktopName)
      .forEach((des) => {
        if (des.ip && des.ip !== currenDesktop?.ip) {
          ipList.push(des.ip);
        }
        if (des.name && des.name !== currenDesktop?.name) {
          desNameList.push(des.name);
        }
      });

    return { ipList, desNameList };
  }, [desktops]);

  //get desktop by id
  useEffect(() => {
    const fetchDesktop = async () => {
      if (!hasPermission('get_VDI_info')) return;

      try {
        setLoading(true);
        const res = await axiosClient.get(
          `/virtualDesktops/${
            userDetails?.virtualDesktops.find((d) => d.name === desktopName)?.id
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCurrentDesktop(res.data.result);
      } catch (err) {
        console.error('Error fetching desktop:', err);
      } finally {
        setLoading(false);
        setLoadingDesktops(false);
      }
    };

    fetchDesktop();
  }, [desktopName, token, loadingDesktops, hasPermission]);

  if (!hasPermission('get_VDI_info')) return <Error />;

  // Hiển thị Spinner nếu đang tải dữ liệu
  if (loading || loadingDesktops) {
    return <Spinner />;
  }

  // Nếu không tìm thấy desktop sau khi đã tải xong dữ liệu
  if (!currenDesktop) {
    return <Spinner />;
  }

  return <DesktopDetails desktop={currenDesktop} ipList={ipList} desNameList={desNameList} />;
};

export default DeskDetails;
