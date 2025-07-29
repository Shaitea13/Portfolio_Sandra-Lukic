import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class ShutdownTimerApp extends JFrame {
    private JSpinner minuteSpinner, hourSpinner, endMinuteSpinner;
    private JButton startButton, cancelButton, nowShutdownButton;
    private JProgressBar progressBar;
    private Timer timer;
    private int totalTime;
    private long startTimeMillis;
    private JLabel timeDisplay;
    private Timer clockTimer;
    private JLabel percentageLabel;
    private JButton activeButton;
    private Map<JButton, String> buttonActions;
    private JRadioButton minuteRadio, endTimeRadio;
    private ButtonGroup timeSelectionGroup;
    
    private String pendingAction = null;
    private JButton pendingActionButton = null;
    
    // Variable für den Timer-Listener
    private ActionListener currentTimerListener = null;
    
    public ShutdownTimerApp() {
        setSize(450, 450);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new GridLayout(0, 1));
        buttonActions = new HashMap<>();
        
        // Überschrift
        JLabel headline = new JLabel("Shutdown Timer", SwingConstants.CENTER);
        headline.setFont(new Font("Arial", Font.BOLD, 20));
        add(headline);
        
        // Icons für Aktionen
        JPanel iconPanel = new JPanel();
        iconPanel.setLayout(new GridLayout(1, 4, 0, 0));
        iconPanel.add(createLabeledButton("Sperren", "/images/sperren.png", Color.YELLOW));
        iconPanel.add(createLabeledButton("Energie_sparen", "/images/energie_sparen.png", Color.CYAN));
        iconPanel.add(createLabeledButton("Neu_starten", "/images/neu_starten.png", Color.GREEN));
        iconPanel.add(createLabeledButton("Herunterfahren", "/images/herunterfahren.png", new Color(255, 100, 100)));
        add(iconPanel);
        
        // Steuerbuttons
        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 50, 20));
        nowShutdownButton = new JButton("Schließen");
        nowShutdownButton.setPreferredSize(new Dimension(100, 25));
        nowShutdownButton.setFont(new Font("Arial", Font.BOLD, 12));
        cancelButton = new JButton("Abbrechen");
        cancelButton.setPreferredSize(new Dimension(100, 25));
        cancelButton.setFont(new Font("Arial", Font.BOLD, 12));
        actionPanel.add(nowShutdownButton);
        actionPanel.add(cancelButton);
        add(actionPanel);
        
        // Timer-Auswahl Panel
        JPanel timerSelectionPanel = new JPanel();
        timerSelectionPanel.setLayout(new BoxLayout(timerSelectionPanel, BoxLayout.Y_AXIS));
        timerSelectionPanel.setBorder(BorderFactory.createTitledBorder("Timer-Einstellung"));
        
        // Radio Buttons für Auswahl
        timeSelectionGroup = new ButtonGroup();
        
        // Zeiteinstellung für Minuten
        JPanel minutePanel = new JPanel();
        minutePanel.setLayout(new FlowLayout(FlowLayout.LEFT, 5, 0));
        minuteRadio = new JRadioButton();
        minuteRadio.setSelected(true);
        timeSelectionGroup.add(minuteRadio);
        minutePanel.add(minuteRadio);
        
        JLabel minuteLabel = new JLabel("Ausführen in:   ");
        minuteLabel.setFont(new Font("Arial", Font.BOLD, 14));
        minutePanel.add(minuteLabel);
        minuteSpinner = new JSpinner(new SpinnerNumberModel(30, 1, 120, 1));
        minuteSpinner.setPreferredSize(new Dimension(120, 25));
        minuteSpinner.setFont(new Font("Arial", Font.BOLD, 14));
        minutePanel.add(minuteSpinner);
        JLabel minuteUnitLabel = new JLabel(" Minuten");
        minuteUnitLabel.setFont(new Font("Arial", Font.BOLD, 14));
        minutePanel.add(minuteUnitLabel);
        
        // Endzeit Panel
        JPanel endTimePanel = new JPanel();
        endTimePanel.setLayout(new FlowLayout(FlowLayout.LEFT, 5, 5));
        endTimeRadio = new JRadioButton();
        timeSelectionGroup.add(endTimeRadio);
        endTimePanel.add(endTimeRadio);
        
        JLabel endTimeLabel = new JLabel("Ausführen um:");
        endTimeLabel.setFont(new Font("Arial", Font.BOLD, 14));
        endTimePanel.add(endTimeLabel);
        
        hourSpinner = new JSpinner(new SpinnerNumberModel(0, 0, 23, 1));
        hourSpinner.setPreferredSize(new Dimension(50, 25));
        hourSpinner.setFont(new Font("Arial", Font.BOLD, 14));
        endTimePanel.add(hourSpinner);
        
        endTimePanel.add(new JLabel(" : "));
        
        endMinuteSpinner = new JSpinner(new SpinnerNumberModel(0, 0, 59, 1));
        endMinuteSpinner.setPreferredSize(new Dimension(50, 25));
        endMinuteSpinner.setFont(new Font("Arial", Font.BOLD, 14));
        endTimePanel.add(endMinuteSpinner);
        
        JLabel endMinuteUnitLabel = new JLabel(" Uhr");
        endMinuteUnitLabel.setFont(new Font("Arial", Font.BOLD, 14));
        endTimePanel.add(endMinuteUnitLabel);
        
        // Listener für Radio Buttons
        minuteRadio.addActionListener(e -> updateSpinnerStates());
        endTimeRadio.addActionListener(e -> updateSpinnerStates());
        
        // Panels zusammenführen
        timerSelectionPanel.add(minutePanel);
        timerSelectionPanel.add(endTimePanel);
        add(timerSelectionPanel);
        
        // Timer starten Button und aktuelle Uhrzeit
        JPanel bottomPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 50, 30));
        startButton = new JButton("Timer starten");
        startButton.setPreferredSize(new Dimension(150, 30));
        startButton.setFont(new Font("Arial", Font.BOLD, 14));
        bottomPanel.add(startButton);
        timeDisplay = new JLabel("Zeit: 00:00:00");
        timeDisplay.setHorizontalAlignment(SwingConstants.RIGHT);
        timeDisplay.setFont(new Font("Arial", Font.BOLD, 15));
        bottomPanel.add(timeDisplay);
        add(bottomPanel);
        
        // Fortschrittsbalken
        JPanel progressPanel = new JPanel();
        progressPanel.setLayout(new BoxLayout(progressPanel, BoxLayout.Y_AXIS));
        progressPanel.setBorder(BorderFactory.createEmptyBorder(20, 0, 0, 0));
        percentageLabel = new JLabel("0%");
        percentageLabel.setHorizontalAlignment(SwingConstants.CENTER);
        percentageLabel.setFont(new Font("Arial", Font.BOLD, 12));
        percentageLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        progressPanel.add(percentageLabel);
        progressBar = new JProgressBar(0, 100);
        progressBar.setStringPainted(false);
        progressBar.setPreferredSize(new Dimension(350, 10));
        progressBar.setForeground(Color.GREEN);
        progressPanel.add(progressBar);
        add(progressPanel);
        
        // ActionListener für die Buttons
        startButton.addActionListener(new StartTimerListener());
        nowShutdownButton.addActionListener(e -> executeShutdown());
        cancelButton.addActionListener(e -> cancelTimer());
        
        // Timer für die Uhrzeit
        clockTimer = new Timer(1000, e -> updateCurrentTime());
        clockTimer.start();
        
        // Initial state
        updateSpinnerStates();
    }
    
    private void updateSpinnerStates() {
        minuteSpinner.setEnabled(minuteRadio.isSelected());
        hourSpinner.setEnabled(endTimeRadio.isSelected());
        endMinuteSpinner.setEnabled(endTimeRadio.isSelected());
    }
    
    private JPanel createLabeledButton(String actionName, String iconPath, Color backgroundColor) {
        JPanel panel = new JPanel();
        panel.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        JButton button = new JButton();
        button.setPreferredSize(new Dimension(80, 80));
        button.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        button.setContentAreaFilled(false);
        
        // Icon hinzufügen
        if (iconPath != null) {
            try {
                ImageIcon icon = new ImageIcon(getClass().getResource(iconPath));
                Image scaledImage = icon.getImage().getScaledInstance(30, 30, Image.SCALE_SMOOTH);
                button.setIcon(new ImageIcon(scaledImage));
            } catch (Exception e) {
                System.err.println("Fehler beim Laden des Icons: " + iconPath);
            }
        }
        button.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        // Hintergrundfarbe setzen
        if (backgroundColor != null) {
            button.setBackground(backgroundColor);
            button.setOpaque(true);
        }
        panel.add(button);
        
        // Label unter dem Button
        String displayText = actionName.replace('_', ' ');
        JLabel label = new JLabel(displayText);
        label.setForeground(Color.BLACK);
        label.setAlignmentX(Component.CENTER_ALIGNMENT);
        label.setFont(new Font("Arial", Font.BOLD, 10));
        label.setBorder(BorderFactory.createEmptyBorder(5, 0, 0, 0));
        panel.add(label);
        
        // Button-ActionListener - ALLE Aktionen werden jetzt für Timer geplant
        buttonActions.put(button, actionName);
        button.addActionListener(e -> {
            // Alle Aktionen werden jetzt für den Timer vorgemerkt
            pendingAction = actionName;
            pendingActionButton = button;
            // Button bleibt im normalen Zustand bis Timer startet
        });
        
        return panel;
    }
    
    private void showGif(JButton button) {
        try {
            ImageIcon gifIcon = new ImageIcon(getClass().getResource("/images/spinner.gif")); 
            gifIcon.getImage().flush();
            button.setIcon(gifIcon); 
            activeButton = button;
            button.setDisabledIcon(gifIcon);
            button.setEnabled(false);
        } catch (Exception e) {
            System.err.println("Fehler beim Laden des Spinner-GIFs");
        }
    }
    
    // Universelle Methode für alle geplanten Aktionen
    private void performScheduledAction(String action) {
        try {
            Runtime runtime = Runtime.getRuntime();
            switch (action) {
                case "Sperren":
                    runtime.exec("rundll32.exe user32.dll,LockWorkStation");
                    break;
                    
                case "Energie_sparen":
                    runtime.exec("powercfg -hibernate off");
                    runtime.exec("rundll32.exe powrprof.dll,SetSuspendState 0,1,0");
                    break;
                    
                case "Neu_starten":
                    // Methode 1: Taskkill für alle Prozesse + sofortiger Neustart
                    try {
                        // Alle Benutzerprozesse beenden (außer kritische Systemprozesse)
                        runtime.exec("cmd /c taskkill /F /FI \"USERNAME eq %USERNAME%\" /FI \"IMAGENAME ne explorer.exe\" /FI \"IMAGENAME ne cmd.exe\"");
                        Thread.sleep(500); // Kurze Pause
                        runtime.exec("cmd /c shutdown /r /f /t 0");
                    } catch (Exception e1) {
                        // Methode 2: PowerShell mit WMI (umgeht Windows-Dialoge)
                        try {
                            String[] cmd = {
                                "powershell.exe",
                                "-ExecutionPolicy", "Bypass",
                                "-Command",
                                "$os = Get-WmiObject Win32_OperatingSystem; $os.Win32Shutdown(2+4)"
                                // 2 = Reboot, 4 = Force
                            };
                            runtime.exec(cmd);
                        } catch (Exception e2) {
                            // Methode 3: Direkter WMI-Aufruf
                            runtime.exec("wmic os where primary=true call reboot");
                        }
                    }
                    break;
                    
                case "Herunterfahren":
                    // Methode 1: Taskkill für alle Prozesse + sofortiges Herunterfahren
                    try {
                        // Alle Benutzerprozesse beenden
                        runtime.exec("cmd /c taskkill /F /FI \"USERNAME eq %USERNAME%\" /FI \"IMAGENAME ne explorer.exe\" /FI \"IMAGENAME ne cmd.exe\"");
                        Thread.sleep(500); // Kurze Pause
                        runtime.exec("cmd /c shutdown /s /f /t 0");
                    } catch (Exception e1) {
                        // Methode 2: PowerShell mit WMI
                        try {
                            String[] cmd = {
                                "powershell.exe",
                                "-ExecutionPolicy", "Bypass",
                                "-Command",
                                "$os = Get-WmiObject Win32_OperatingSystem; $os.Win32Shutdown(1+4)"
                                // 1 = Shutdown, 4 = Force
                            };
                            runtime.exec(cmd);
                        } catch (Exception e2) {
                            // Methode 3: Direkter WMI-Aufruf
                            runtime.exec("wmic os where primary=true call shutdown");
                        }
                    }
                    break;
            }
            
            // Alternative: Process Builder für erhöhte Rechte (nur für Neustart/Herunterfahren)
            if (action.equals("Neu_starten") || action.equals("Herunterfahren")) {
                try {
                    ProcessBuilder pb = new ProcessBuilder();
                    if (action.equals("Neu_starten")) {
                        pb.command("cmd", "/c", "shutdown", "/r", "/f", "/t", "0");
                    } else {
                        pb.command("cmd", "/c", "shutdown", "/s", "/f", "/t" ,"0");
                    }
                    pb.start();
                } catch (Exception pbEx) {
                    // Ignorieren und auf andere Methoden verlassen
                }
            }
            
        } catch (Exception ex) {
            // Notfall-Methode für Neustart/Herunterfahren
            if (action.equals("Neu_starten") || action.equals("Herunterfahren")) {
                try {
                    String batchContent = action.equals("Neu_starten") 
                        ? "@echo off\ntaskkill /F /FI \"USERNAME eq %USERNAME%\"\nshutdown /r /f /t 0"
                        : "@echo off\ntaskkill /F /FI \"USERNAME eq %USERNAME%\"\nshutdown /s /f /t 0";
                    
                    java.nio.file.Path tempBatch = java.nio.file.Files.createTempFile("shutdown", ".bat");
                    java.nio.file.Files.write(tempBatch, batchContent.getBytes());
                    Runtime.getRuntime().exec("cmd /c \"" + tempBatch.toString() + "\"");
                    
                } catch (Exception finalEx) {
                    JOptionPane.showMessageDialog(this, "Fehler bei der Ausführung: " + finalEx.getMessage());
                    resetButtonIcon();
                }
            } else {
                JOptionPane.showMessageDialog(this, "Fehler bei der Ausführung: " + ex.getMessage());
                resetButtonIcon();
            }
        }
    }
    
    private void resetButtonIcon() {
        if (activeButton != null) {
            String action = buttonActions.get(activeButton);
            if (action != null) {
                String iconFileName = action.toLowerCase();
                try {
                    ImageIcon originalIcon = new ImageIcon(getClass().getResource("/images/" + iconFileName + ".png"));
                    Image scaledImage = originalIcon.getImage().getScaledInstance(30, 30, Image.SCALE_SMOOTH);
                    activeButton.setIcon(new ImageIcon(scaledImage));
                    activeButton.setDisabledIcon(null);
                    activeButton.setEnabled(true);
                } catch (Exception e) {
                    System.err.println("Fehler beim Zurücksetzen des Icons");
                }
                activeButton = null;
            }
        }
    }
    
    private void executeShutdown() {
        int confirm = JOptionPane.showConfirmDialog(this, 
                "Möchten Sie die Anwendung wirklich schließen?", 
                "Anwendung beenden", 
                JOptionPane.YES_NO_OPTION);
        if (confirm == JOptionPane.YES_OPTION) {
            System.exit(0);
        }
    }
    
    private void cancelTimer() {
        // Timer sofort stoppen und alle Referenzen entfernen
        if (timer != null && timer.isRunning()) {
            timer.stop();
            
            // Alle ActionListener vom Timer entfernen
            if (currentTimerListener != null) {
                timer.removeActionListener(currentTimerListener);
                currentTimerListener = null;
            }
            
            // Alle anderen ActionListener entfernen
            ActionListener[] listeners = timer.getActionListeners();
            for (ActionListener listener : listeners) {
                timer.removeActionListener(listener);
            }
            
            timer = null;
        }
        
        // UI sofort zurücksetzen
        SwingUtilities.invokeLater(() -> {
            progressBar.setValue(0);
            percentageLabel.setText("0%");
            progressBar.repaint();
            percentageLabel.repaint();
        });
        
        // Button-Icon zurücksetzen
        resetButtonIcon();
        
        // Meldung anzeigen
        if (pendingAction != null) {
            String actionName = pendingAction.replace('_', ' ');
            pendingAction = null;
            pendingActionButton = null;
            JOptionPane.showMessageDialog(this, 
                "Der Timer und die geplante Aktion '" + actionName + "' wurden abgebrochen.",
                "Abgebrochen",
                JOptionPane.INFORMATION_MESSAGE);
        } else {
            JOptionPane.showMessageDialog(this, 
                "Der Timer wurde abgebrochen.",
                "Abgebrochen", 
                JOptionPane.INFORMATION_MESSAGE);
        }
    }
    
    private void updateCurrentTime() {
        String currentTime = new SimpleDateFormat("HH:mm:ss").format(Calendar.getInstance().getTime());
        timeDisplay.setText("Zeit: " + currentTime);
    }
    
    private class StartTimerListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            try {
                // Prüfung ob eine Aktion ausgewählt wurde
                if (pendingAction == null) {
                    JOptionPane.showMessageDialog(
                        ShutdownTimerApp.this, 
                        "Bitte wählen Sie zuerst eine Aktion (Sperren, Energie sparen, Neu starten oder Herunterfahren).",
                        "Keine Aktion ausgewählt",
                        JOptionPane.WARNING_MESSAGE
                    );
                    return;
                }
                
                // GIF erst beim Timer-Start zeigen
                if (pendingActionButton != null) {
                    showGif(pendingActionButton);
                }
                
                int totalMinutes;
                String timerInfo;
                
                // Verwende Radio Button Auswahl
                if (minuteRadio.isSelected()) {
                    // Minuten-basierter Timer
                    totalMinutes = (Integer) minuteSpinner.getValue();
                    timerInfo = totalMinutes + " Minuten";
                    totalTime = totalMinutes * 60; // Konvertiere zu Sekunden
                } else {
                    // Endzeit-basierter Timer mit präziser Berechnung
                    Calendar now = Calendar.getInstance();
                    Calendar endTime = Calendar.getInstance();
                    endTime.set(Calendar.HOUR_OF_DAY, (Integer) hourSpinner.getValue());
                    endTime.set(Calendar.MINUTE, (Integer) endMinuteSpinner.getValue());
                    endTime.set(Calendar.SECOND, 0);
                    endTime.set(Calendar.MILLISECOND, 0); // Wichtig: Millisekunden auf 0 setzen
                    
                    // Wenn die Endzeit vor oder gleich der aktuellen Zeit liegt, auf morgen setzen
                    if (endTime.before(now) || endTime.equals(now)) {
                        endTime.add(Calendar.DAY_OF_MONTH, 1);
                    }
                    
                    // Präzise Berechnung der Differenz in Millisekunden
                    long diffMillis = endTime.getTimeInMillis() - now.getTimeInMillis();
                    
                    // Konvertiere zu Minuten für Anzeige (aufgerundet)
                    totalMinutes = (int) Math.ceil(diffMillis / (60.0 * 1000.0));
                    
                    // Für totalTime verwenden wir die exakte Sekundenzahl
                    double exactSeconds = diffMillis / 1000.0;
                    totalTime = (int) Math.ceil(exactSeconds); // Aufrunden für Genauigkeit
                    
                    SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
                    timerInfo = timeFormat.format(endTime.getTime()) + " Uhr";
                    
                    // Debug-Ausgabe für Endzeit-Timer
                    System.out.println("Endzeit-Timer eingestellt:");
                    System.out.println("  Aktuelle Zeit: " + new SimpleDateFormat("HH:mm:ss").format(now.getTime()));
                    System.out.println("  Zielzeit: " + timerInfo);
                    System.out.println("  Differenz: " + (diffMillis/1000) + " Sekunden (" + totalMinutes + " Minuten)");
                    System.out.println("  Total Zeit für Timer: " + totalTime + " Sekunden");
                }
                
                if (totalTime > 0) {
                    String displayAction = pendingAction.replace('_', ' ');
                    
                    // Info-Meldung bei Endzeit-Timer
                    if (endTimeRadio.isSelected()) {
                        System.out.println("Timer startet für " + timerInfo + " (" + totalTime + " Sekunden)");
                    }
                    
                    // WICHTIG: ProgressBar Maximum auf 100 setzen (für Prozentanzeige)
                    progressBar.setMaximum(100);
                    progressBar.setValue(0);
                    percentageLabel.setText("0%");
                    
                    // Startzeit erfassen für präzises Timing
                    startTimeMillis = System.currentTimeMillis();
                    
                    // Debug-Ausgabe
                    System.out.println("Timer gestartet: " + totalTime + " Sekunden");
                    
                    // Neuer ActionListener erstellen und speichern
                    currentTimerListener = new ActionListener() {
                        private volatile boolean cancelled = false;
                        private volatile boolean finished = false;
                        
                        @Override
                        public void actionPerformed(ActionEvent evt) {
                            // Prüfen ob abgebrochen wurde
                            if (cancelled || finished || timer == null || !timer.isRunning()) {
                                return;
                            }
                            
                            // Berechne verstrichene Zeit basierend auf System-Zeit
                            long currentTimeMillis = System.currentTimeMillis();
                            long elapsedMillis = currentTimeMillis - startTimeMillis;
                            double elapsedSeconds = elapsedMillis / 1000.0;
                            
                            // Debug-Ausgabe alle 10 Sekunden
                            if ((int)elapsedSeconds % 10 == 0 && (int)elapsedSeconds > 0) {
                                System.out.println("Verstrichene Zeit: " + (int)elapsedSeconds + " / " + totalTime + " Sekunden");
                            }
                            
                            if (elapsedSeconds < totalTime) {
                                // Berechne Fortschritt basierend auf tatsächlich verstrichener Zeit
                                double progress = elapsedSeconds / totalTime;
                                int percentValue = (int) Math.round(progress * 100);
                                
                                // Begrenze auf maximal 99% während des Laufens
                                percentValue = Math.min(percentValue, 99);
                                
                                final int finalPercentValue = percentValue;
                                SwingUtilities.invokeLater(() -> {
                                    if (!cancelled && !finished) {
                                        progressBar.setValue(finalPercentValue);
                                        percentageLabel.setText(finalPercentValue + "%");
                                    }
                                });
                                
                            } else if (!finished) {
                                // Timer beenden - stelle sicher, dass 100% angezeigt wird
                                finished = true;
                                
                                SwingUtilities.invokeLater(() -> {
                                    if (!cancelled) {
                                        progressBar.setValue(100);
                                        percentageLabel.setText("100%");
                                        progressBar.repaint();
                                        percentageLabel.repaint();
                                    }
                                });
                                
                                // Timer beenden
                                Timer sourceTimer = (Timer) evt.getSource();
                                sourceTimer.stop();
                                
                                // Kurze Pause damit 100% sichtbar ist
                                try {
                                    Thread.sleep(1000);
                                } catch (InterruptedException ie) {}
                                
                                // App-Fenster schließen
                                SwingUtilities.invokeLater(() -> {
                                    ShutdownTimerApp.this.dispose();
                                });
                                
                                // Kurze Verzögerung
                                try {
                                    Thread.sleep(100);
                                } catch (InterruptedException ie) {}
                                
                                // Aktion ausführen
                                if (pendingAction != null) {
                                    System.out.println("Timer abgelaufen, führe aus: " + pendingAction);
                                    performScheduledAction(pendingAction);
                                    pendingAction = null;
                                    pendingActionButton = null;
                                }
                            }
                        }
                    };
                    
                    // Timer mit höherer Update-Frequenz für flüssigere Anzeige
                    timer = new Timer(50, currentTimerListener); // Update alle 50ms
                    timer.setCoalesce(false); // Verhindert das Zusammenfassen von Timer-Events
                    timer.setInitialDelay(0); // Startet sofort
                    timer.start();
                    
                    System.out.println("Timer läuft mit " + timer.getDelay() + "ms Intervall");
                    
                } else {
                    JOptionPane.showMessageDialog(null, "Bitte geben Sie eine gültige Zeit ein.");
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(null, "Fehler: " + ex.getMessage());
                ex.printStackTrace();
            }
        }
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            ShutdownTimerApp app = new ShutdownTimerApp();
            app.setVisible(true);
        });
    }
}