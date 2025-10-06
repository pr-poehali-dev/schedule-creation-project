import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const initialScheduleData: ScheduleItem[] = [
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

const API_URL = 'https://functions.poehali.dev/2737a169-f899-401d-a27f-c71bfba5bb62';

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
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    teacher: '',
    subject: '',
    time: '',
    classroom: '',
    day: 'monday',
    type: 'lecture',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setScheduleData(data.schedule || initialScheduleData);
    } catch (error) {
      setScheduleData(initialScheduleData);
    } finally {
      setIsLoading(false);
    }
  };

  const teachers = ['all', ...new Set(scheduleData.map((item) => item.teacher))];

  const filteredSchedule = scheduleData.filter(
    (item) =>
      item.day === selectedDay &&
      (selectedTeacher === 'all' || item.teacher === selectedTeacher)
  );

  const openDialog = (item?: ScheduleItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        teacher: '',
        subject: '',
        time: '',
        classroom: '',
        day: selectedDay,
        type: 'lecture',
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      teacher: '',
      subject: '',
      time: '',
      classroom: '',
      day: 'monday',
      type: 'lecture',
    });
  };

  const handleSave = async () => {
    if (!formData.teacher || !formData.subject || !formData.time || !formData.classroom) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingItem) {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id }),
        });
        
        if (response.ok) {
          await loadSchedule();
          toast({
            title: 'Занятие обновлено',
            description: 'Изменения сохранены',
          });
        }
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          await loadSchedule();
          toast({
            title: 'Занятие добавлено',
            description: 'Новое занятие создано',
          });
        }
      }
      closeDialog();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadSchedule();
        toast({
          title: 'Занятие удалено',
          description: 'Занятие удалено из расписания',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить занятие',
        variant: 'destructive',
      });
    }
  };

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
            <Button onClick={() => openDialog()} className="bg-primary text-white">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Добавить занятие
            </Button>
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
              {isLoading ? (
                <Card className="text-center py-12 bg-white">
                  <CardContent>
                    <Icon name="Loader2" className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-slate-500">Загрузка расписания...</p>
                  </CardContent>
                </Card>
              ) : filteredSchedule.length === 0 ? (
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
                        <div className="flex items-center gap-2">
                          <Badge className={typeColors[item.type]}>
                            {typeLabels[item.type]}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDialog(item)}
                            className="h-8 w-8"
                          >
                            <Icon name="Pencil" className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Редактировать занятие' : 'Добавить занятие'}
              </DialogTitle>
              <DialogDescription>
                Заполните информацию о занятии
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Предмет</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Математический анализ"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher">Преподаватель</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  placeholder="Иванова М.А."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="time">Время</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="9:00 - 10:30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="classroom">Аудитория</Label>
                  <Input
                    id="classroom"
                    value={formData.classroom}
                    onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                    placeholder="Ауд. 301"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="day">День недели</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value) => setFormData({ ...formData, day: value })}
                  >
                    <SelectTrigger id="day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(dayNames).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Тип занятия</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Лекция</SelectItem>
                      <SelectItem value="practice">Практика</SelectItem>
                      <SelectItem value="lab">Лаборатория</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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