import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faEdit, 
  faTrash,
  faUserGraduate,
  faUsers,
  faCheckCircle,
  faKey,
  faStar
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

const getGenColor = (gen: number) => {
  return 'bg-[#8B0000] text-[#ffa282]';
};

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
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white flex-1 line-clamp-2">
              {event.title}
            </h3>
            <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(event.currentGen)}`}>
              {event.currentGen}기
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
              {event.eventType}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
              {status.text}
            </span>
          </div>
        </div>
      </div>

      {event.description && (
        <div className="mb-3">
          <p className="text-white/70 text-sm line-clamp-2">{event.description}</p>
        </div>
      )}
      {!event.description && (
        <div className="mb-3 h-10"></div>
      )}

      <div className="space-y-2 text-sm text-white/60 mb-4">
        <div className="flex items-start space-x-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mt-0.5" />
          <div>
            <div>{event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -</div>
            <div>{event.endTime.toLocaleDateString()} {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
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
          <div className="flex items-center gap-2">
            {event.isAttendanceRequired && (
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                className="w-4 h-4 text-green-400" 
                title="출석 필수"
              />
            )}
            {event.isAttendanceCodeRequired && (
              <FontAwesomeIcon 
                icon={faKey} 
                className="w-4 h-4 text-blue-400" 
                title="출석 코드 필수"
              />
            )}
            {event.hasAttendanceCode && (
              <FontAwesomeIcon 
                icon={faStar} 
                className="w-4 h-4 text-yellow-400" 
                title="출석 코드 존재"
              />
            )}
          </div>
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
