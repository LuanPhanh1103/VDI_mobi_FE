// FE ProjectsPage.tsx - Danh sách Project dạng bảng + chức năng tạo/xoá
import { useEffect, useState } from 'react';
import { Button, Modal, Table } from 'flowbite-react';
import { Icon } from '@iconify/react';
import axiosClient from 'src/api/axiosClient';
import toast from 'react-hot-toast';
import InputText from '../input/InputText';
import { useUser } from 'src/hooks/UserContext';

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
}

const ProjectsPage = () => {
  const { token, userDetails  } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data.result);
    } catch (err) {
      toast.error('Không thể tải danh sách project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await axiosClient.post(
        '/projects',
        { name, description, ownerId: userDetails?.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success('Tạo project thành công');
      setOpenModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      toast.error('Tạo project thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Đã xoá project');
      fetchProjects();
    } catch (err) {
      toast.error('Không thể xoá');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-darkgray rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        <Button color="primary" onClick={() => setOpenModal(true)}>Tạo mới</Button>
      </div>

      <Table>
        <Table.Head>
          <Table.HeadCell>Tên</Table.HeadCell>
          <Table.HeadCell>Mô tả</Table.HeadCell>
          <Table.HeadCell>Owner</Table.HeadCell>
          <Table.HeadCell>Thành viên</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {projects.map((p) => (
            <Table.Row key={p.id} className="bg-white dark:bg-gray-800">
              <Table.Cell>{p.name}</Table.Cell>
              <Table.Cell>{p.description}</Table.Cell>
              <Table.Cell>{p.ownerId}</Table.Cell>
              <Table.Cell>{p.memberIds.length}</Table.Cell>
              <Table.Cell>
                <Button size="xs" color="failure" onClick={() => handleDelete(p.id)}>
                  Xoá
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Tạo project mới</Modal.Header>
        <Modal.Body>
          <InputText
            label="Tên project"
            value={name}
            onChange={setName}
            required={true}
            isEditable={true}
          />
          <InputText
            label="Mô tả"
            value={description}
            onChange={setDescription}
            required={false}
            isEditable={true}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleCreate}>Tạo</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>Huỷ</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
