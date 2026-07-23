# Schlüsselwirbel-Verschlüsselung

Eine interaktive Lernanwendung zur Visualisierung eines selbst entwickelten symmetrischen Verschlüsselungsverfahrens.

Das Projekt zeigt schrittweise, wie ein Text mithilfe eines gemeinsamen Schlüssels verschoben und anschließend blockweise vertauscht wird. Die Anwendung kann Texte sowohl verschlüsseln als auch wieder entschlüsseln.

> Dieses Verfahren dient ausschließlich zu Lernzwecken. Für den Schutz echter vertraulicher Daten sollten geprüfte Verfahren wie AES verwendet werden.

## Funktionen

- Texte direkt im Browser ver- und entschlüsseln
- frei wählbarer Schlüssel mit mindestens sechs Zeichen
- Berechnung jedes einzelnen Zeichens anzeigen
- Modulo-81-Rechnung nachvollziehen
- Blockvertauschung grafisch darstellen
- vollständige Zeichentabelle anzeigen
- Zwischen- und Endergebnis kopieren
- responsive Darstellung für Computer und Smartphone

## Projekt starten

Es ist keine Installation und kein Webserver erforderlich.

1. Das Repository herunterladen oder klonen.
2. Den Ordner [`Webseite`](Webseite) öffnen.
3. Die Datei [`Webseite/index.html`](Webseite/index.html) mit einem Webbrowser öffnen.
4. Text und Schlüssel eingeben.
5. **Verschlüsseln** oder **Entschlüsseln** auswählen.

## Beispiel

Klartext:

```text
Der Serverraum wird am Freitag um 15 Uhr gewartet.
```

Schlüssel:

```text
WALNUSS
```

Geheimtext:

```text
f0Eö.nZm7 '!1'75-Z8.YKkCAM)D5aMkcM'Y9GrNYlNDXReeQ1
```

## Wie funktioniert das Verfahren?

Die Schlüsselwirbel-Verschlüsselung besteht aus zwei Schritten:

1. **Zeichenverschiebung:** Für jedes Zeichen werden Klartextzahl, Schlüsselzahl und Textposition addiert. Das Ergebnis wird modulo 81 berechnet.
2. **Blockvertauschung:** Der Zwischentext wird in Blöcke aufgeteilt. Die Reihenfolge der Zeichen wird durch die sortierten Positionen des Schlüssels bestimmt.

Beim Entschlüsseln werden beide Schritte in umgekehrter Reihenfolge rückgängig gemacht.

Eine ausführliche Erklärung befindet sich in der [Anleitung](Anleitung_Schluesselwirbel.md).

## Dateien

| Datei | Inhalt |
|---|---|
| [`Webseite/index.html`](Webseite/index.html) | Aufbau der Webanwendung |
| [`Webseite/styles.css`](Webseite/styles.css) | Gestaltung und responsive Darstellung |
| [`Webseite/script.js`](Webseite/script.js) | Ver- und Entschlüsselungslogik |
| [`Anleitung_Schluesselwirbel.md`](Anleitung_Schluesselwirbel.md) | Einsteigerfreundliche Bedienungsanleitung |
| [`Loesung_Verschluesselung.md`](Loesung_Verschluesselung.md) | Ausarbeitung der Aufgaben A1 bis A5 |

## Verwendeter Zeichenvorrat

Das Verfahren arbeitet mit 81 Zeichen:

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜabcdefghijklmnopqrstuvwxyzäöüß0123456789 .,!?;:-()'"
```

Jedes Zeichen besitzt eine feste Zahl zwischen 0 und 80. Groß- und Kleinschreibung, Leerzeichen, Umlaute, Zahlen und die aufgeführten Satzzeichen werden berücksichtigt.

## Technische Voraussetzungen

Ein aktueller Webbrowser mit aktiviertem JavaScript genügt. Die Anwendung verwendet keine externen Bibliotheken und überträgt keine eingegebenen Texte an einen Server.

## Hinweis zur Sicherheit

Schlüsselwirbel ist ein selbst entwickeltes klassisches Lernverfahren. Es wurde nicht professionell kryptografisch geprüft und darf nicht für reale Geheimnisse, Zugangsdaten oder personenbezogene Daten verwendet werden.
