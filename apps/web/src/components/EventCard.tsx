import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faEdit, 
  faTrash,
  faUserGraduate,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { Event } from '@prometheus-fe/types';
import GlassCard from './GlassCard';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  onAttendanceManage?: (event: Event) => void;
  onClick?: () => void;
  isAdmin?: boolean;
}

const getEventStatus = (event: Event) => {
  const isUpcoming = event.startTime > new Date();
  const isOngoing = event.startTime <= new Date() && event.endTime >= new Date();
  const isPast = event.endTime < new Date();

  if (isOngoing) return { text: '진행중', color: 'bg-green-500/20 text-green-300' };
  if (isUpcoming) return { text: '예정', color: 'bg-blue-500/20 text-blue-300' };
  return { text: '종료', color: 'bg-gray-500/20 text-gray-300' };
};

export default function EventCard({ event, onEdit, onDelete, onClick, onAttendanceManage, isAdmin }: EventCardProps) {
  const status = getEventStatus(event);

  return (
    <GlassCard 
      className={`p-4 transition-colors ${isAdmin ? 'hover:bg-white/10' : 'hover:bg-white/15 cursor-pointer'}`}
      onClick={isAdmin ? undefined : onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            <span className="text-red-300 font-bold">{event.currentGen}기</span> {event.title}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
              {event.eventType}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
              {status.text}
            </span>
            {event.isAttendanceRequired && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                출석필수
              </span>
            )}
            {event.isAttendanceCodeRequired && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                코드필수
              </span>
            )}
            {event.hasAttendanceCode && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                코드존재
              </span>
            )}
          </div>
        </div>
      </div>

      {event.description && (
        <p className="text-white/70 text-sm mb-3 line-clamp-2">{event.description}</p>
      )}

      <div className="space-y-2 text-sm text-white/60 mb-4">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
          <span>
            {event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {event.location && (
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="inline-flex items-center px-3 py-1 text-sm bg-green-500/20 border border-green-500/30 rounded text-green-300 hover:bg-green-500/30 transition-colors"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
              수정
            </button>
          )}
          {onAttendanceManage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAttendanceManage(event);
              }}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-500/30 transition-colors"
            >
              <FontAwesomeIcon icon={faUsers} className="mr-1 h-3 w-3" />
              출석관리
            </button>
          )}
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id);
            }}
            className="inline-flex items-center px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 rounded text-red-300 hover:bg-red-500/30 transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
          </button>
        )}
      </div>
    </GlassCard>
  );
}
