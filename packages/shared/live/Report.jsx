import { useServer } from './context.jsx';
import { Form } from './Forms.jsx';
function Report({ targetType, targetId }) {
  const { api, user } = useServer();
  if (!user) return null;
  return (
    <details>
      <summary>Laporkan masalah</summary>
      <Form
        fields={[{ key: "category", label: "Kategori masalah" }, "description"]}
        button="Kirim laporan"
        submit={(data) =>
          api.request("/reports", {
            method: "POST",
            body: { ...data, target_type: targetType, target_id: targetId },
          })
        }
      />
    </details>
  );
}
export { Report };
