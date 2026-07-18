from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "een-week-mentale-rekbaarheid.pdf"

W, H = A4
MARGIN = 18 * mm

INK = HexColor("#143d3d")
INK_DARK = HexColor("#092a29")
COPPER = HexColor("#bd6b38")
GOLD = HexColor("#d3a33f")
PAPER = HexColor("#f7f1e6")
PAPER_LIGHT = HexColor("#fffdf8")
SAGE = HexColor("#dce8df")
PLUM = HexColor("#2b1a2b")
PLUM_LIGHT = HexColor("#744134")
MUTED = HexColor("#526766")
LINE = HexColor("#c7d1cc")


pdfmetrics.registerFont(TTFont("SiteSerif", "/System/Library/Fonts/Supplemental/Georgia.ttf"))
pdfmetrics.registerFont(TTFont("SiteSerifBold", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"))
pdfmetrics.registerFont(TTFont("SiteSerifItalic", "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"))
pdfmetrics.registerFont(TTFont("SiteSans", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("SiteSansBold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))


STYLES = {
    "body": ParagraphStyle(
        "body", fontName="SiteSans", fontSize=10.2, leading=15, textColor=MUTED, spaceAfter=0
    ),
    "small": ParagraphStyle(
        "small", fontName="SiteSans", fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=0
    ),
    "card": ParagraphStyle(
        "card", fontName="SiteSerif", fontSize=14, leading=19, textColor=INK_DARK, spaceAfter=0
    ),
    "card_small": ParagraphStyle(
        "card_small", fontName="SiteSans", fontSize=9.2, leading=13.2, textColor=MUTED, spaceAfter=0
    ),
    "center": ParagraphStyle(
        "center", fontName="SiteSans", fontSize=10, leading=14, textColor=MUTED, alignment=TA_CENTER
    ),
    "quote": ParagraphStyle(
        "quote", fontName="SiteSerifItalic", fontSize=13, leading=18, textColor=INK
    ),
    "cover": ParagraphStyle(
        "cover", fontName="SiteSerif", fontSize=14, leading=20, textColor=HexColor("#d9ccd7")
    ),
}


def draw_paragraph(c, text, x, top, width, style="body"):
    paragraph = Paragraph(text, STYLES[style])
    _, height = paragraph.wrap(width, H)
    paragraph.drawOn(c, x, top - height)
    return top - height


def round_box(c, x, y, width, height, fill, stroke=LINE, radius=10, line_width=0.8):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(line_width)
    c.roundRect(x, y, width, height, radius, fill=1, stroke=1)


def field(c, name, label, x, top, width, height, prompt=""):
    c.setFillColor(INK)
    c.setFont("SiteSansBold", 8.3)
    c.drawString(x, top, label.upper())
    box_top = top - 8
    c.acroForm.textfield(
        name=name,
        tooltip=label,
        x=x,
        y=box_top - height,
        width=width,
        height=height,
        borderStyle="solid",
        borderWidth=0.8,
        borderColor=LINE,
        fillColor=PAPER_LIGHT,
        textColor=INK_DARK,
        fontName="Helvetica",
        fontSize=10,
        forceBorder=True,
        fieldFlags="multiline",
    )
    if prompt:
        c.setFillColor(HexColor("#8a9996"))
        c.setFont("SiteSans", 7.5)
        c.drawString(x + 7, box_top - 12, prompt)
    return box_top - height


def short_field(c, name, label, x, top, width):
    c.setFillColor(INK)
    c.setFont("SiteSansBold", 8)
    c.drawString(x, top, label.upper())
    c.acroForm.textfield(
        name=name,
        tooltip=label,
        x=x,
        y=top - 24,
        width=width,
        height=18,
        borderStyle="underlined",
        borderWidth=0.8,
        borderColor=LINE,
        fillColor=PAPER_LIGHT,
        textColor=INK_DARK,
        fontName="Helvetica",
        fontSize=9,
        forceBorder=True,
    )


def footer(c, page_number, label="MENSLAB"):
    y = 13 * mm
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(MARGIN, y + 8, W - MARGIN, y + 8)
    c.setFillColor(MUTED)
    c.setFont("SiteSansBold", 7)
    c.drawString(MARGIN, y - 1, f"DE ONWIJZE WIJSHEDEN  /  {label}")
    c.drawRightString(W - MARGIN, y - 1, f"{page_number:02d}")


def day_header(c, number, verb, subtitle):
    c.setFillColor(PAPER_LIGHT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(SAGE if number % 2 else PAPER)
    c.circle(W - 34, H - 22, 82, fill=1, stroke=0)
    c.setFillColor(COPPER)
    c.setFont("SiteSansBold", 8)
    c.drawString(MARGIN, H - 37, f"DAG {number}  /  ZEVEN KLEINE BEWEGINGEN")
    c.setFillColor(INK)
    c.setFont("SiteSerifBold", 30)
    c.drawString(MARGIN, H - 76, verb)
    c.setFont("SiteSerifItalic", 12)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, H - 98, subtitle)
    c.setStrokeColor(GOLD)
    c.setLineWidth(3)
    c.line(MARGIN, H - 114, MARGIN + 54, H - 114)


def prompt_card(c, title, body, top):
    height = 69
    round_box(c, MARGIN, top - height, W - 2 * MARGIN, height, PAPER, stroke=HexColor("#e1d6c5"), radius=12)
    c.setFillColor(COPPER)
    c.setFont("SiteSansBold", 7.5)
    c.drawString(MARGIN + 14, top - 18, title.upper())
    draw_paragraph(c, body, MARGIN + 14, top - 29, W - 2 * MARGIN - 28, "card")
    return top - height


def observation(c, text, top):
    height = 48
    c.setFillColor(INK)
    c.roundRect(MARGIN, top - height, W - 2 * MARGIN, height, 12, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("SiteSansBold", 7.5)
    c.drawString(MARGIN + 14, top - 17, "KLEINE ONTHOUDER")
    draw_paragraph(c, text, MARGIN + 14, top - 24, W - 2 * MARGIN - 28, "small")
    return top - height


def cover(c):
    c.setFillColor(PLUM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#5f415c"))
    c.setLineWidth(1)
    for radius in (74, 122, 170):
        c.circle(W - 50, H - 90, radius, fill=0, stroke=1)
    c.setStrokeColor(GOLD)
    c.setLineWidth(3.2)
    c.arc(W - 220, H - 260, W + 60, H + 20, 204, 105)
    c.setFillColor(GOLD)
    c.circle(W - 90, H - 99, 5, fill=1, stroke=0)

    c.setFillColor(GOLD)
    c.setFont("SiteSansBold", 9)
    c.drawString(MARGIN, H - 82, "MENSLAB  /  EEN PRINTBAAR MINI-WERKBOEK")
    c.setFillColor(PAPER_LIGHT)
    c.setFont("SiteSerifBold", 35)
    c.drawString(MARGIN, H - 168, "Een week")
    c.drawString(MARGIN, H - 210, "mentale rekbaarheid")
    c.setFillColor(HexColor("#d9ccd7"))
    draw_paragraph(
        c,
        "Zeven kleine uitnodigingen om je automatische route even te verlaten. Geen perfect programma. Geen streak. Wel een spoor.",
        MARGIN,
        H - 247,
        365,
        "cover",
    )

    y = 245
    c.setStrokeColor(HexColor("#795b76"))
    c.setLineWidth(1)
    c.line(MARGIN, y + 30, W - MARGIN, y + 30)
    verbs = ["MERK OP", "VERTRAAG", "DRAAI OM", "VERANDER", "BENOEM", "VRAAG", "KIES"]
    for index, verb in enumerate(verbs, 1):
        x = MARGIN + (index - 1) * ((W - 2 * MARGIN) / 7)
        c.setFillColor(GOLD if index in (1, 7) else HexColor("#795b76"))
        c.circle(x + 8, y + 30, 5, fill=1, stroke=0)
        c.setFillColor(HexColor("#d9ccd7"))
        c.setFont("SiteSansBold", 5.9)
        c.drawCentredString(x + 8, y + 12, verb)

    c.setFillColor(HexColor("#d9ccd7"))
    c.setFont("SiteSans", 8)
    c.drawString(MARGIN, 35, "DE ONWIJZE WIJSHEDEN  /  DE MENSELIJKE ATLAS")
    c.showPage()


def introduction(c):
    c.setFillColor(PAPER_LIGHT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(COPPER)
    c.setFont("SiteSansBold", 8)
    c.drawString(MARGIN, H - 46, "VOOR JE BEGINT")
    c.setFillColor(INK)
    c.setFont("SiteSerifBold", 29)
    c.drawString(MARGIN, H - 86, "Dit is geen zevenstappenplan")
    c.setFont("SiteSerifBold", 29)
    c.drawString(MARGIN, H - 120, "naar een betere versie van jou.")
    draw_paragraph(
        c,
        "Het is een kleine veldproef. Je onderzoekt zeven dagen lang wat er gebeurt wanneer je een automatische reactie net genoeg vertraagt om opnieuw te kunnen kiezen.",
        MARGIN,
        H - 148,
        W - 2 * MARGIN,
        "body",
    )

    cards = [
        ("01", "Klein is geldig", "Een poging van twintig seconden telt. Een gemiste dag zegt niets over je karakter."),
        ("02", "Nieuwsgierig, niet streng", "Schrijf op wat je werkelijk merkte, niet wat je denkt dat hier hoort te staan."),
        ("03", "Veiligheid eerst", "Gebruik geen situatie die acuut onveilig of overweldigend is als oefenmateriaal."),
    ]
    y = H - 232
    card_w = (W - 2 * MARGIN - 18) / 3
    for i, (number, title, body) in enumerate(cards):
        x = MARGIN + i * (card_w + 9)
        round_box(c, x, y - 142, card_w, 142, PAPER if i != 1 else SAGE, radius=12)
        c.setFillColor(COPPER)
        c.setFont("SiteSerifBold", 18)
        c.drawString(x + 12, y - 24, number)
        c.setFillColor(INK)
        c.setFont("SiteSerifBold", 12)
        c.drawString(x + 12, y - 48, title)
        draw_paragraph(c, body, x + 12, y - 63, card_w - 24, "small")

    c.setFillColor(INK)
    c.setFont("SiteSerifBold", 17)
    c.drawString(MARGIN, 388, "Jouw week")
    short_field(c, "naam_of_werktitel", "Naam of werktitel", MARGIN, 362, 245)
    short_field(c, "startdatum", "Startdatum", MARGIN + 270, 362, 120)

    y_line = 302
    verbs = ["Merk op", "Vertraag", "Draai om", "Verander", "Benoem", "Vraag", "Kies"]
    for index, verb in enumerate(verbs, 1):
        y = y_line - (index - 1) * 29
        c.setFillColor(SAGE if index % 2 else PAPER)
        c.circle(MARGIN + 11, y, 10, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("SiteSansBold", 7.5)
        c.drawCentredString(MARGIN + 11, y - 2.5, str(index))
        c.setFont("SiteSerifBold", 10.5)
        c.drawString(MARGIN + 31, y - 3, verb)
        c.setStrokeColor(LINE)
        c.line(MARGIN + 115, y - 3, W - MARGIN, y - 3)

    draw_paragraph(
        c,
        "Digitaal invullen kan ook. Wat je typt blijft in dit PDF-bestand. Bewaar daarna een kopie onder een eigen naam.",
        MARGIN,
        92,
        W - 2 * MARGIN,
        "small",
    )
    footer(c, 2)
    c.showPage()


def day_one(c):
    day_header(c, 1, "Merk op", "Een automatische reactie hoeft niet fout te zijn om interessant te worden.")
    top = prompt_card(c, "De uitnodiging", "Noteer één moment waarop je automatisch reageerde.", H - 135) - 22
    top = field(c, "d1_moment", "Wat gebeurde er - zo concreet mogelijk?", MARGIN, top, W - 2 * MARGIN, 80, "Plaats, persoon, woorden, timing...") - 20
    top = field(c, "d1_impuls", "Wat deed je als eerste - in je hoofd, lichaam of gedrag?", MARGIN, top, W - 2 * MARGIN, 70, "Bijvoorbeeld: versnellen, verklaren, terugtrekken, pleasen...") - 20
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "d1_beschermen", "Wat probeerde deze reactie te beschermen?", MARGIN, top, half, 76)
    bottom = field(c, "d1_achteraf", "Wat zag je pas achteraf?", MARGIN + half + gap, top, half, 76)
    observation(c, "Je hoeft vandaag nog niets te veranderen. Een automatische route zichtbaar maken is al beweging.", bottom - 22)
    footer(c, 3, "DAG 1  /  MERK OP")
    c.showPage()


def day_two(c):
    day_header(c, 2, "Vertraag", "Tien seconden kunnen klein lijken en toch een andere afslag openen.")
    top = prompt_card(c, "De uitnodiging", "Wacht tien seconden voordat je op iets prikkelends antwoordt.", H - 135) - 22
    top = field(c, "d2_prikkel", "Wat trok je direct naar een reactie?", MARGIN, top, W - 2 * MARGIN, 72) - 20
    c.setFillColor(INK)
    c.setFont("SiteSerifBold", 14)
    c.drawString(MARGIN, top, "De pauze in drie tellen")
    top -= 25
    steps = [("1", "VOEL", "Waar landt dit in je lichaam?"), ("2", "ADEM", "Niet om kalm te moeten worden, wel om tijd te winnen."), ("3", "KIES", "Antwoorden, vragen, uitstellen of niets doen?")]
    box_w = (W - 2 * MARGIN - 16) / 3
    for i, (num, title, body) in enumerate(steps):
        x = MARGIN + i * (box_w + 8)
        round_box(c, x, top - 103, box_w, 103, SAGE if i == 1 else PAPER, radius=10)
        c.setFillColor(COPPER)
        c.setFont("SiteSerifBold", 17)
        c.drawString(x + 11, top - 23, num)
        c.setFillColor(INK)
        c.setFont("SiteSansBold", 8)
        c.drawString(x + 11, top - 42, title)
        draw_paragraph(c, body, x + 11, top - 51, box_w - 22, "small")
    top -= 126
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "d2_voor", "Wat wilde je vóór de pauze doen?", MARGIN, top, half, 80)
    bottom = field(c, "d2_na", "Wat koos je na de pauze?", MARGIN + half + gap, top, half, 80)
    observation(c, "Vertragen is geen verplichting om vriendelijker te antwoorden. Soms maakt de pauze juist een duidelijke grens mogelijk.", bottom - 22)
    footer(c, 4, "DAG 2  /  VERTRAAG")
    c.showPage()


def day_three(c):
    day_header(c, 3, "Draai om", "Een ander perspectief onderzoeken is niet hetzelfde als jezelf ongelijk geven.")
    top = prompt_card(c, "De uitnodiging", "Bedenk de sterkste reden waarom de andere persoon gelijk kán hebben.", H - 135) - 22
    top = field(c, "d3_mijn_verhaal", "Wat is jouw eerste lezing van de situatie?", MARGIN, top, W - 2 * MARGIN, 74) - 20
    top = field(c, "d3_hun_reden", "Wat is de sterkste redelijke lezing van de andere kant?", MARGIN, top, W - 2 * MARGIN, 86, "Geen karikatuur. Maak hun argument zo sterk mogelijk.") - 20
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "d3_beweegt", "Wat beweegt hierdoor een beetje?", MARGIN, top, half, 78)
    bottom = field(c, "d3_blijft", "Waar blijf je nog steeds bij?", MARGIN + half + gap, top, half, 78)
    observation(c, "Mentale rekbaarheid betekent twee dingen tegelijk kunnen vasthouden: ik kan iets missen én toch een geldige grens hebben.", bottom - 22)
    footer(c, 5, "DAG 3  /  DRAAI OM")
    c.showPage()


def day_four(c):
    day_header(c, 4, "Verander", "Kleine afwijkingen laten zien hoeveel van een dag op automatische rails rijdt.")
    top = prompt_card(c, "De uitnodiging", "Doe een gewone handeling vandaag bewust op een andere manier.", H - 135) - 22
    top = field(c, "d4_gewoonte", "Welke gewone handeling koos je?", MARGIN, top, W - 2 * MARGIN, 62, "Een route, volgorde, plek, tempo of klein ritueel.") - 20
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "d4_normaal", "Hoe gaat het normaal?", MARGIN, top, half, 86)
    bottom = field(c, "d4_anders", "Wat deed je nu anders?", MARGIN + half + gap, top, half, 86)
    top = bottom - 20
    top = field(c, "d4_merkte", "Wat merkte je doordat het patroon even haperde?", MARGIN, top, W - 2 * MARGIN, 82) - 22
    observation(c, "Het doel is niet om alles origineel te doen. Gewoontes besparen energie. Je onderzoekt alleen waar nog keuze zit.", top)
    footer(c, 6, "DAG 4  /  VERANDER")
    c.showPage()


def day_five(c):
    day_header(c, 5, "Benoem", "Een precies woord maakt een gevoel niet kleiner, maar vaak wel beter navigeerbaar.")
    top = prompt_card(c, "De uitnodiging", "Geef een gevoel een preciezere naam dan 'goed' of 'slecht'.", H - 135) - 22
    top = field(c, "d5_situatie", "Welk moment bleef bij je hangen?", MARGIN, top, W - 2 * MARGIN, 57) - 19
    c.setFillColor(INK)
    c.setFont("SiteSansBold", 8.2)
    c.drawString(MARGIN, top, "WOORDEN OM AAN TE PROEVEN")
    words = "onrustig  /  geraakt  /  opgelucht  /  beschaamd  /  verlangend  /  machteloos  /  prikkelbaar  /  jaloers  /  teder  /  teleurgesteld  /  nieuwsgierig  /  bedreigd"
    round_box(c, MARGIN, top - 54, W - 2 * MARGIN, 43, SAGE, radius=9)
    draw_paragraph(c, words, MARGIN + 12, top - 22, W - 2 * MARGIN - 24, "small")
    top -= 75
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "d5_lichaam", "Waar voelde je iets in je lichaam?", MARGIN, top, half, 78)
    bottom = field(c, "d5_woord", "Welk preciezer woord komt dichtbij?", MARGIN + half + gap, top, half, 78)
    top = bottom - 20
    top = field(c, "d5_nodig", "Waar wijst dit gevoel mogelijk naar - een behoefte, grens, verlies of verlangen?", MARGIN, top, W - 2 * MARGIN, 78) - 22
    observation(c, "Een woord is een werkhypothese, geen vonnis. Je mag het later vervangen door een woord dat beter past.", top)
    footer(c, 7, "DAG 5  /  BENOEM")
    c.showPage()


def day_six(c):
    day_header(c, 6, "Vraag", "Zelfkennis heeft soms een buitenraam nodig.")
    top = prompt_card(c, "De uitnodiging", "Vraag iemand wat jij volgens hen soms niet bij jezelf ziet.", H - 135) - 22
    top = field(c, "d6_persoon", "Wie koos je - en waarom voelt deze persoon voldoende veilig en eerlijk?", MARGIN, top, W - 2 * MARGIN, 66) - 20
    round_box(c, MARGIN, top - 56, W - 2 * MARGIN, 56, PAPER, radius=10)
    c.setFillColor(COPPER)
    c.setFont("SiteSansBold", 7.5)
    c.drawString(MARGIN + 12, top - 17, "EEN MOGELIJKE OPENING")
    draw_paragraph(c, "'Ik probeer iets over mezelf te zien. Wat is iets goeds of lastigs dat jij bij mij opmerkt en dat ik misschien onderschat?'", MARGIN + 12, top - 26, W - 2 * MARGIN - 24, "quote")
    top -= 78
    top = field(c, "d6_antwoord", "Wat zei de ander - zo letterlijk mogelijk?", MARGIN, top, W - 2 * MARGIN, 82) - 20
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "d6_resoneert", "Wat resoneert?", MARGIN, top, half, 74)
    bottom = field(c, "d6_niet", "Wat herken je niet of wil je bevragen?", MARGIN + half + gap, top, half, 74)
    observation(c, "Feedback is informatie uit één relatie, niet de definitieve waarheid over jou.", bottom - 22)
    footer(c, 8, "DAG 6  /  VRAAG")
    c.showPage()


def day_seven(c):
    day_header(c, 7, "Kies", "Geen groot voornemen. Eén kleine reactie die op een echt moment kan bestaan.")
    top = prompt_card(c, "De uitnodiging", "Kies één kleine reactie die je volgende week anders wilt proberen.", H - 135) - 22
    top = field(c, "d7_patron", "Welke terugkerende situatie wil je als oefenplek gebruiken?", MARGIN, top, W - 2 * MARGIN, 65) - 20
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "d7_oud", "Mijn automatische reactie", MARGIN, top, half, 74)
    bottom = field(c, "d7_nieuw", "Mijn kleine alternatief", MARGIN + half + gap, top, half, 74)
    top = bottom - 20
    round_box(c, MARGIN, top - 69, W - 2 * MARGIN, 69, SAGE, radius=11)
    c.setFillColor(COPPER)
    c.setFont("SiteSansBold", 7.5)
    c.drawString(MARGIN + 13, top - 18, "MAAK ER EEN ALS-DAN-ZIN VAN")
    draw_paragraph(c, "Als __________________________________ gebeurt, dan probeer ik eerst __________________________________.", MARGIN + 13, top - 32, W - 2 * MARGIN - 26, "card")
    top -= 92
    top = field(c, "d7_mild", "Wat is een milde terugkeer wanneer het niet lukt?", MARGIN, top, W - 2 * MARGIN, 70, "Bijvoorbeeld: opmerken, herstellen, opnieuw vragen of het later nog eens proberen.") - 22
    observation(c, "Een keuze wordt betrouwbaarder wanneer ze klein, zichtbaar en herhaalbaar is - niet wanneer ze streng klinkt.", top)
    footer(c, 9, "DAG 7  /  KIES")
    c.showPage()


def closing(c):
    c.setFillColor(PAPER_LIGHT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.roundRect(0, H - 178, W, 190, 28, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("SiteSansBold", 8)
    c.drawString(MARGIN, H - 48, "NA ZEVEN KLEINE BEWEGINGEN")
    c.setFillColor(PAPER_LIGHT)
    c.setFont("SiteSerifBold", 29)
    c.drawString(MARGIN, H - 88, "Wat bleef er bewegen?")
    draw_paragraph(
        c,
        "Ook een onvolledige week kan een echt spoor achterlaten. Kijk niet naar wat je afvinkte, maar naar wat je begon op te merken.",
        MARGIN,
        H - 111,
        W - 2 * MARGIN,
        "card_small",
    )
    top = H - 212
    gap = 10
    half = (W - 2 * MARGIN - gap) / 2
    field(c, "slot_verrast", "Wat verraste je?", MARGIN, top, half, 82)
    bottom = field(c, "slot_bleef", "Wat bleef moeilijk?", MARGIN + half + gap, top, half, 82)
    top = bottom - 21
    top = field(c, "slot_inzicht", "Welke zin wil je van deze week onthouden?", MARGIN, top, W - 2 * MARGIN, 66) - 20
    top = field(c, "slot_volgende", "Wat wil je meenemen naar een volgende week?", MARGIN, top, W - 2 * MARGIN, 66) - 20

    c.setFillColor(INK)
    c.setFont("SiteSerifBold", 14)
    c.drawString(MARGIN, top, "Mijn week was")
    checks = [("slot_geprobeerd", "geprobeerd"), ("slot_onvolledig", "onvolledig en toch echt"), ("slot_rond", "voor nu rond")]
    x = MARGIN
    for name, label in checks:
        c.acroForm.checkbox(
            name=name,
            tooltip=label,
            x=x,
            y=top - 34,
            size=14,
            buttonStyle="check",
            borderColor=LINE,
            fillColor=PAPER_LIGHT,
            forceBorder=True,
        )
        c.setFillColor(MUTED)
        c.setFont("SiteSans", 8.5)
        c.drawString(x + 20, top - 30, label)
        x += 145

    round_box(c, MARGIN, 84, W - 2 * MARGIN, 54, PAPER, radius=10)
    c.setFillColor(COPPER)
    c.setFont("SiteSansBold", 7.2)
    c.drawString(MARGIN + 12, 121, "GOED OM TE WETEN")
    draw_paragraph(
        c,
        "Dit werkboek is een uitnodiging tot zelfonderzoek, geen diagnose of behandeling. Stop wanneer een oefening onveilig of overweldigend voelt en zoek passende hulp wanneer klachten aanhouden of je dagelijks leven sterk verstoren.",
        MARGIN + 12,
        113,
        W - 2 * MARGIN - 24,
        "small",
    )
    footer(c, 10, "JOUW SPOOR")
    c.showPage()


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Een week mentale rekbaarheid")
    c.setAuthor("De Onwijze Wijsheden")
    c.setSubject("Een printbaar en digitaal invulbaar Menslab-werkboek")
    cover(c)
    introduction(c)
    day_one(c)
    day_two(c)
    day_three(c)
    day_four(c)
    day_five(c)
    day_six(c)
    day_seven(c)
    closing(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
