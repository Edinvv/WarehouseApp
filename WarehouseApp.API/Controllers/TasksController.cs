using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Application.Features.Tasks.Commands;
using WarehouseApp.Application.Features.Tasks.Queries;

namespace WarehouseApp.API.Controllers;

    public record UpdateStatusRequest(string Status);
     [ApiController]
    [Route("api/[controller]")]
        public class TasksController: ControllerBase
    {
        private readonly IMediator _mediator;

        public TasksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] Guid sectorId)
        {
            var result= await _mediator.Send(new GetTaskBySectorQuery(sectorId));
            return Ok(result);
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> CreateTask(CreateTaskCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPut("{id}/status")]
[Authorize]
public async Task<IActionResult> UpdateStatus(Guid id, UpdateStatusRequest request)
{
    if (!Enum.TryParse<WarehouseApp.Domain.Enums.TaskStatus>(request.Status, out var status))
        return BadRequest("Invalid status value.");

    var result = await _mediator.Send(new UpdateTaskStatusCommand(id, status));
    return result ? Ok() : NotFound();
}


    }