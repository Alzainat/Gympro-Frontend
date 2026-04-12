import api from "../api/axios";

export const getProgressPhotos = async (pose = "") => {
  const url = pose
    ? `/member/progress-photos?pose=${encodeURIComponent(pose)}`
    : "/member/progress-photos";

  const res = await api.get(url);
  return res.data;
};

export const uploadProgressPhoto = async (formData) => {
  const res = await api.post("/member/progress-photos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteProgressPhoto = async (id) => {
  const res = await api.delete(`/member/progress-photos/${id}`);
  return res.data;
};

export const getProgressComparison = async (months = 3, pose = "") => {
  const params = new URLSearchParams();
  params.append("months", months);
  if (pose) params.append("pose", pose);

  const res = await api.get(`/member/progress-photos/comparison?${params.toString()}`);
  return res.data;
};