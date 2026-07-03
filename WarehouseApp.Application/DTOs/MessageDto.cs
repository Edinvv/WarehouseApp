

namespace WarehouseApp.Application.DTOs;

    public record MessageDto 
    (
        Guid Id,
        string Content,
        DateTime SentAt,
        bool IsRead,
        string SenderId,
        string SenderName,
        string ReceiverName,
        string ReceiverId
    );
   
