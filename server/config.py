# The columns an admin may set on each resource. Anything else sent by the client is ignored.
RESOURCES = {
    "notices": ["title", "department", "type", "date", "body"],
    "forms": ["name", "department", "description", "file"],
    "contacts": ["name", "role", "department", "email", "office", "hours"],
    "faqs": ["service", "question", "answer"],
    "fees": ["course", "per_term"],
    "units": ["name", "department", "trainer_ids"],
    "guides": ["section", "issue", "steps", "cost", "location", "note", "contact_id", "form_id"],
    "course_requirements": ["course", "requirement", "duration"],
    "exam_timetable": ["unit", "exam_date", "exam_time", "venue"],
    "academic_calendar": ["event", "period"],
    "assignments": ["unit", "assignment", "due_date"],
}

ORDER = {
    "notices": "`date` DESC, id DESC",
    "forms": "id",
    "contacts": "id",
    "faqs": "id",
    "fees": "id",
    "units": "id",
    "guides": "section, id",
    "course_requirements": "id",
    "exam_timetable": "exam_date, id",
    "academic_calendar": "id",
    "assignments": "due_date, id",
}

# Fields that may be left empty (stored as NULL)
OPTIONAL = {
    "units": {"trainer_ids"},
    "guides": {"cost", "location", "note", "contact_id", "form_id"},
}
INT_FIELDS = {"contact_id", "form_id"}
DATE_FIELDS = {"date", "exam_date", "due_date"}

# Inbox tables the administrator can read and manage. The list is the allowed statuses (None = no status).
INBOX = {
    "complaints": ["New", "In progress", "Resolved"],
    "requests": ["New", "In progress", "Done"],
    "subscribers": None,
}
