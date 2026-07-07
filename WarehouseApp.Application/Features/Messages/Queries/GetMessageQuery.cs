using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;


namespace WarehouseApp.Application.Features.Messages.Queries;

public record GetMessageQuery(string UserId, string OtherUserId) : IRequest<List<MessageDto>>;
public class GetMessageQueryHandler : IRequestHandler<GetMessageQuery, List<MessageDto>>
{
    private readonly IAppDbContext _context;
    public GetMessageQueryHandler(IAppDbContext context)
    {
        _context = context;
    }
    public async Task<List<MessageDto>> Handle(GetMessageQuery request, CancellationToken cancellationToken)
    {
        return await _context.Messages
    .Where(m =>
        (m.SenderId == request.UserId && m.ReceiverId == request.OtherUserId) ||
        (m.SenderId == request.OtherUserId && m.ReceiverId == request.UserId))
    .Include(m => m.Sender)
    .Include(m => m.Receiver)
    .OrderBy(m => m.SentAt)
    .Select(m => new MessageDto(
        m.Id,
        m.Content,
        m.SentAt,
        m.IsRead,
        m.SenderId,
        m.Sender.FirstName + " " + m.Sender.LastName,
        m.Receiver.FirstName + " " + m.Receiver.LastName,
        m.ReceiverId
    ))
    .ToListAsync(cancellationToken);

    }


}
