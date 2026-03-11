import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Типы для ответов API
interface ScoreBucket {
  bucket: string;
  count: number;
}

interface TimelinePoint {
  date: string;
  count: number;
}

interface PassRate {
  task: string;
  pass_rate: number; // ожидаем число от 0 до 100
}

type LabId = string;

const LAB_IDS: LabId[] = ['lab-04', 'lab-05', 'lab-06']; // добавьте свои варианты

const Dashboard: React.FC = () => {
  const [selectedLab, setSelectedLab] = useState<LabId>('lab-04');
  const [scoreData, setScoreData] = useState<ScoreBucket[]>([]);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [passRates, setPassRates] = useState<PassRate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Чтение токена из localStorage
  const getToken = (): string | null => localStorage.getItem('api_key');

  // Функция для загрузки данных с авторизацией
  const fetchWithAuth = async (url: string) => {
    const token = getToken();
    if (!token) {
      throw new Error('No API token found in localStorage');
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response.json();
  };

  // Загрузка всех данных при изменении selectedLab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = `/analytics`; // предполагается, что API проксируется или находится по тому же origin
        const [scores, timeline, pass] = await Promise.all([
          fetchWithAuth(`${baseUrl}/scores?lab=${selectedLab}`),
          fetchWithAuth(`${baseUrl}/timeline?lab=${selectedLab}`),
          fetchWithAuth(`${baseUrl}/pass-rates?lab=${selectedLab}`),
        ]);
        setScoreData(scores);
        setTimelineData(timeline);
        setPassRates(pass);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedLab]);

  // Подготовка данных для bar chart (распределение баллов)
  const barChartData = {
    labels: scoreData.map((item) => item.bucket),
    datasets: [
      {
        label: 'Количество студентов',
        data: scoreData.map((item) => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  // Подготовка данных для line chart (субмиссии по дням)
  const lineChartData = {
    labels: timelineData.map((item) => item.date),
    datasets: [
      {
        label: 'Субмиссии',
        data: timelineData.map((item) => item.count),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Распределение баллов' },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Субмиссии по дням' },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Аналитика лабораторных работ</h1>

      {/* Выпадающий список для выбора лабораторной */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="lab-select">Выберите лабораторную: </label>
        <select
          id="lab-select"
          value={selectedLab}
          onChange={(e) => setSelectedLab(e.target.value as LabId)}
        >
          {LAB_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

      {!loading && !error && (
        <>
          {/* Бар-чарт */}
          <div style={{ marginBottom: '40px', maxWidth: '600px' }}>
            <Bar data={barChartData} options={barOptions} />
          </div>

          {/* Лайн-чарт */}
          <div style={{ marginBottom: '40px', maxWidth: '600px' }}>
            <Line data={lineChartData} options={lineOptions} />
          </div>

          {/* Таблица с проходами по задачам */}
          <div>
            <h2>Процент прохождения по задачам</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Задача</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Процент прохождения</th>
                </tr>
              </thead>
              <tbody>
                {passRates.map((item) => (
                  <tr key={item.task}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.task}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.pass_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
