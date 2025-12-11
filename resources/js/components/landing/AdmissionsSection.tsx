import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { FileText, ClipboardCheck, MessageCircle, CheckCircle, UserPlus } from 'lucide-react';

const steps = [
    {
        icon: FileText,
        number: '1',
        title: 'Submit Application',
        description: 'Complete the online application form with required documents and information.',
    },
    {
        icon: ClipboardCheck,
        number: '2',
        title: 'Take Entrance Exam',
        description: 'Participate in our assessment to evaluate academic readiness and aptitude.',
    },
    {
        icon: MessageCircle,
        number: '3',
        title: 'Attend Interview',
        description: 'Meet with our admissions team and faculty to discuss your goals and interests.',
    },
    {
        icon: CheckCircle,
        number: '4',
        title: 'Receive Decision',
        description: 'Get notified of your admission status and available scholarship opportunities.',
    },
    {
        icon: UserPlus,
        number: '5',
        title: 'Enroll',
        description: 'Complete enrollment procedures and join the Saint Francis College community.',
    },
];

export function AdmissionsSection() {
    return null;
}
