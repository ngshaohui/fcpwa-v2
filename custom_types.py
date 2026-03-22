from typing import TypedDict


class Cue(TypedDict):
    text: str
    transliteration: str
    translation: str
    audioUrl: str | None
    category: str


class Sentence(TypedDict):
    text: str
    textCue: str
    transliteration: str
    transliterationCue: str
    translation: str
    audioUrl: str | None


class CourseItem(TypedDict):
    id: str  # UUID
    cue: Cue
    sentences: list[Sentence]


class PracticeItem(TypedDict):
    courseItemId: str
    active: int
    repetitions: int
    easeFactor: float
    date: int


class QuizItem(TypedDict):
    courseItem: CourseItem
    practiceItem: PracticeItem
