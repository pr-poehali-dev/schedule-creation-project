import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ScheduleItem {
  id: string;
  teacher: string;
  subject: string;
  time: string;
  classroom: string;
  day: string;
  type: 'lecture' | 'practice' | 'lab';
}

const scheduleData: ScheduleItem[] = [
  {
    id: '1',
    teacher: 'Иванова М.А.',
    subject: 'Математический анализ',
    time: '9:00 - 10:30',
    classroom: 'Ауд. 301',
    day: 'monday',
    type: 'lecture',
  },
  {
    id: '2',
    teacher: 'Петров В.И.',
    subject: 'Программирование',
    time: '10:45 - 12:15',
    classroom: 'Ауд. 205',
    day: 'monday',
    type: 'practice',
  },
  {
    id: '3',
    teacher: 'Сидорова Л.П.',
    subject: 'Физика',
    time: '12:30 - 14:00',
    classroom: 'Ауд. 108',
    day: 'monday',
    type: 'lab',
  },
  {
    id: '4',
    teacher: 'Иванова М.А.',
    subject: 'Высшая математика',
    time: '9:00 - 10:30',
    classroom: 'Ауд. 301',
    day: 'tuesday',
    type: 'lecture',
  },
  {
    id: '5',
    teacher: 'Козлов А.С.',
    subject: 'Алгоритмы и структуры данных',
    time: '10:45 - 12:15',
    classroom: 'Ауд. 210',
    day: 'tuesday',
    type: 'practice',
  },
  {
    id: '6',
    teacher: 'Петров В.И.',
    subject: 'Web-разработка',
    time: '14:15 - 15:45',
    classroom: 'Ауд. 205',
    day: 'wednesday',
    type: 'lab',
  },
];

const dayNames: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
};

const typeColors: Record<string, string> = {
  lecture: 'bg-blue-100 text-blue-800',
  practice: 'bg-green-100 text-green-800',
  lab: 'bg-purple-100 text-purple-800',
};

const typeLabels: Record<string, string> = {
  lecture: 'Лекция',
  practice: 'Практика',
  lab: 'Лаборатория',
};

export default function Index() {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const { toast } = useToast();

  const teachers = ['all', ...new Set(scheduleData.map((item) => item.teacher))];

  const filteredSchedule = scheduleData.filter(
    (item) =>
      item.day === selectedDay &&
      (selectedTeacher === 'all' || item.teacher === selectedTeacher)
  );

  const exportToCalendar = () => {
    const icsContent = generateICS(scheduleData);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule.ics';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Экспорт выполнен',
      description: 'Расписание экспортировано в календарь',
    });
  };

  const exportToPDF = () => {
    toast({
      title: 'Экспорт в PDF',
      description: 'Функция экспорта в PDF будет доступна в следующей версии',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Расписание занятий
          </h1>
          <p className="text-slate-600">
            Просмотр расписания по преподавателям и экспорт в удобном формате
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-full md:w-[280px] bg-white">
              <Icon name="User" className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Выберите преподавателя" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все преподаватели</SelectItem>
              {teachers.slice(1).map((teacher) => (
                <SelectItem key={teacher} value={teacher}>
                  {teacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button onClick={exportToCalendar} variant="outline" className="bg-white">
              <Icon name="Calendar" className="mr-2 h-4 w-4" />
              Экспорт в календарь
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="bg-white">
              <Icon name="FileText" className="mr-2 h-4 w-4" />
              Экспорт в PDF
            </Button>
          </div>
        </div>

        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white">
            {Object.entries(dayNames).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-white">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(dayNames).map((day) => (
            <TabsContent key={day} value={day} className="space-y-4">
              {filteredSchedule.length === 0 ? (
                <Card className="text-center py-12 bg-white">
                  <CardContent>
                    <Icon name="CalendarOff" className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">
                      Нет занятий на выбранный день
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredSchedule.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-lg transition-shadow duration-200 bg-white border-l-4 border-l-primary"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {item.subject}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Icon name="User" className="h-4 w-4" />
                            <span className="font-medium">{item.teacher}</span>
                          </div>
                        </div>
                        <Badge className={typeColors[item.type]}>
                          {typeLabels[item.type]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Icon name="Clock" className="h-4 w-4" />
                          <span>{item.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Icon name="MapPin" className="h-4 w-4" />
                          <span>{item.classroom}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function generateICS(schedule: ScheduleItem[]): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const dayMap: Record<string, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
  };

  let ics = 'BEGIN:VCALENDAR\n';
  ics += 'VERSION:2.0\n';
  ics += 'PRODID:-//Schedule//Schedule 1.0//RU\n';

  schedule.forEach((item) => {
    const dayNum = dayMap[item.day];
    const currentDay = now.getDate();
    const currentDayOfWeek = now.getDay() || 7;
    const daysUntilTarget = (dayNum - currentDayOfWeek + 7) % 7;
    const targetDate = new Date(year, month, currentDay + daysUntilTarget);

    const [startTime] = item.time.split(' - ');
    const [hours, minutes] = startTime.split(':');

    const startDateTime = new Date(targetDate);
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1, endDateTime.getMinutes() + 30);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    ics += 'BEGIN:VEVENT\n';
    ics += `UID:${item.id}@schedule\n`;
    ics += `DTSTAMP:${formatDate(now)}\n`;
    ics += `DTSTART:${formatDate(startDateTime)}\n`;
    ics += `DTEND:${formatDate(endDateTime)}\n`;
    ics += `SUMMARY:${item.subject}\n`;
    ics += `DESCRIPTION:Преподаватель: ${item.teacher}\\nТип: ${typeLabels[item.type]}\n`;
    ics += `LOCATION:${item.classroom}\n`;
    ics += 'END:VEVENT\n';
  });

  ics += 'END:VCALENDAR';
  return ics;
}
