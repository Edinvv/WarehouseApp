using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Tasks.Commands;
using WarehouseApp.Application.Features.TaskAssignment.Commands;
using WarehouseApp.Application.Features.Tasks.Queries;

namespace WarehouseApp.API.Controllers;

public record UpdateStatusRequest(string Status);
public record AssignTaskRequest(List<string> UserIds);

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;
    public TasksController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetTasks([FromQuery] Guid sectorId)
    {
        var result = await _mediator.Send(new GetTaskBySectorQuery(sectorId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<IActionResult> CreateTask(CreateTaskCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}/assign")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<IActionResult> AssignTask(Guid id, [FromBody] AssignTaskRequest request)
    {
        var result = await _mediator.Send(new AssignWorkersCommand(id, request.UserIds));
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateStatusRequest request)
    {
        if (!Enum.TryParse<WarehouseApp.Domain.Enums.TaskStatus>(request.Status, out var status))
            return BadRequest("Invalid status value.");

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        var result = await _mediator.Send(new UpdateTaskStatusCommand(id, status, userId, userRole));

        return result switch
        {
            UpdateStatusResult.Success => Ok(),
            UpdateStatusResult.NotFound => NotFound(),
            UpdateStatusResult.Forbidden => Forbid(),
            _ => BadRequest()
        };
    }
}